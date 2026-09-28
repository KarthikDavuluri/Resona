import logging
import uuid
import numpy as np
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.failure import FailureRecord, PatternCluster
from backend.app.services.embedding_service import embedding_service

logger = logging.getLogger("resona.failure_analysis")

class FailureAnalysisService:
    """
    Categorizes failures into 5 dimensions (parameter, process, material, equipment, unexpected_observation)
    and performs scikit-learn clustering to discover recurring failure patterns.
    """

    CATEGORIES = [
        "parameter",
        "process",
        "material",
        "equipment",
        "unexpected_observation"
    ]

    def categorize_failure(self, description: str, parameters: Dict[str, Any]) -> str:
        desc_lower = description.lower()
        if any(term in desc_lower for term in ["temp", "pressure", "concentration", "ph", "ratio"]):
            return "parameter"
        elif any(term in desc_lower for term in ["stirring", "addition", "reflux", "time", "rate"]):
            return "process"
        elif any(term in desc_lower for term in ["impurity", "degraded", "reagent", "catalyst"]):
            return "material"
        elif any(term in desc_lower for term in ["leak", "sensor", "sensor error", "autoclave", "vessel"]):
            return "equipment"
        return "unexpected_observation"

    def cluster_failures(self, db: Session) -> List[PatternCluster]:
        """
        Retrieves all failure records, computes text embeddings, and runs DBSCAN / K-Means clustering.
        """
        failures = db.query(FailureRecord).all()
        if not failures:
            logger.info("No failure records found to cluster.")
            return []

        if len(failures) < 2:
            # Create single cluster for 1 record
            f = failures[0]
            cluster = PatternCluster(
                id=f"cluster_{uuid.uuid4().hex[:8]}",
                cluster_name=f"Pattern: {f.failure_category.capitalize()} Failure",
                cluster_type="failure_pattern",
                description=f.description,
                algorithm="single_sample",
                supporting_experiments_count=1.0,
                confidence=0.8,
                supporting_experiment_ids=[f.experiment_id]
            )
            db.add(cluster)
            f.cluster_id = cluster.id
            db.commit()
            return [cluster]

        # Compute embeddings for failure descriptions
        vectors = [embedding_service.encode(f.description) for f in failures]
        X = np.array(vectors)

        try:
            from sklearn.cluster import DBSCAN
            clustering = DBSCAN(eps=0.5, min_samples=2, metric="cosine").fit(X)
            labels = clustering.labels_
        except Exception as e:
            logger.warning(f"DBSCAN clustering fallback: {e}")
            labels = np.zeros(len(failures), dtype=int)

        clusters_created = []
        unique_labels = set(labels)

        for label in unique_labels:
            indices = [i for i, l in enumerate(labels) if l == label]
            cluster_failures = [failures[i] for i in indices]
            exp_ids = [f.experiment_id for f in cluster_failures]
            
            cluster_name = f"Cluster-{label if label != -1 else 'Noise'}: {cluster_failures[0].failure_category.capitalize()} Pattern"
            desc_summary = f"Group of {len(cluster_failures)} failures: {cluster_failures[0].description}"

            cluster = PatternCluster(
                id=f"cluster_{uuid.uuid4().hex[:8]}",
                cluster_name=cluster_name,
                cluster_type="failure_pattern",
                description=desc_summary,
                algorithm="dbscan",
                supporting_experiments_count=float(len(cluster_failures)),
                confidence=0.85 if label != -1 else 0.5,
                supporting_experiment_ids=exp_ids
            )
            db.add(cluster)
            db.flush()

            for f in cluster_failures:
                f.cluster_id = cluster.id
            
            clusters_created.append(cluster)

        db.commit()
        logger.info(f"Generated {len(clusters_created)} failure clusters.")
        return clusters_created

failure_analysis_service = FailureAnalysisService()
