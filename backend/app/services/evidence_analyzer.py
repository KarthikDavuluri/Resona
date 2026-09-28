import datetime
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.experiment import Experiment, ExperimentOutcome
from backend.app.models.failure import FailureRecord

logger = logging.getLogger("resona.evidence_analyzer")

class EvidenceAnalyzer:
    """
    Analyzes historical experiment outcomes, parameter overlaps, temporal decay,
    contradictions, and transparent confidence scoring.
    """

    def analyze_evidence(
        self,
        db: Session,
        ranked_results: List[Dict[str, Any]],
        proposed_parameters: Dict[str, Any],
        hindsight_memories: List[Dict[str, Any]]
    ) -> Dict[str, Any]:

        total_experiments = len(ranked_results)
        successful_count = 0
        failed_count = 0
        partial_count = 0
        unknown_count = 0

        similarity_sum = 0.0
        contradictions = []
        supporting_experiments = []

        now = datetime.datetime.utcnow()
        temporal_relevance_scores = []

        for item in ranked_results:
            exp: Experiment = item["experiment"]
            score = item["score"]
            similarity_sum += score

            # Temporal decay calculation
            age_days = (now - exp.created_at).days if exp.created_at else 0
            # Decay formula: exp(-0.005 * age_days) -> preserves access, adjusts weighting
            t_decay = round(max(0.2, 1.0 / (1.0 + 0.01 * age_days)), 2)
            temporal_relevance_scores.append(t_decay)

            if exp.outcome:
                st = exp.outcome.status.lower()
                if st == "success":
                    successful_count += 1
                elif st == "failure":
                    failed_count += 1
                elif st == "partial":
                    partial_count += 1
                else:
                    unknown_count += 1
            else:
                unknown_count += 1

            supporting_experiments.append(exp.id)

        avg_similarity = round(similarity_sum / max(1, total_experiments), 2)
        avg_temporal_relevance = round(sum(temporal_relevance_scores) / max(1, len(temporal_relevance_scores)), 2) if temporal_relevance_scores else 1.0

        # Contradiction Detection
        if successful_count > 0 and failed_count > 0:
            contradictions.append({
                "type": "OUTCOME_CONTRADICTION",
                "description": f"Historical evidence shows contradictory outcomes ({successful_count} successes vs {failed_count} failures under similar parameter regions).",
                "severity": "high",
                "affected_experiments": supporting_experiments[:5]
            })

        # Calculate Confidence & Explanation
        confidence_info = self._calculate_confidence(
            total_experiments=total_experiments,
            successful_count=successful_count,
            failed_count=failed_count,
            avg_similarity=avg_similarity,
            contradiction_count=len(contradictions),
            hindsight_count=len(hindsight_memories)
        )

        return {
            "decision_support": {
                "total_similar_experiments": total_experiments,
                "successful_experiments": successful_count,
                "failed_experiments": failed_count,
                "outcome_distribution": {
                    "success": successful_count,
                    "failure": failed_count,
                    "partial": partial_count,
                    "unknown": unknown_count
                },
                "similarity_score": avg_similarity,
                "temporal_relevance": avg_temporal_relevance,
                "contradiction_count": len(contradictions),
                "evidence_coverage": round(min(1.0, total_experiments / 10.0), 2)
            },
            "confidence": confidence_info,
            "contradictions": contradictions
        }

    def _calculate_confidence(
        self,
        total_experiments: int,
        successful_count: int,
        failed_count: int,
        avg_similarity: float,
        contradiction_count: int,
        hindsight_count: int
    ) -> Dict[str, Any]:

        if total_experiments == 0:
            return {
                "score": 0.25,
                "level": "Low",
                "explanation": "Limited historical experience exists for this specific experiment configuration.",
                "key_factors": ["Low sample size", "No prior exact parameter match"]
            }

        score = 0.5
        factors = []

        if total_experiments >= 5:
            score += 0.2
            factors.append(f"Substantial evidence base ({total_experiments} similar experiments)")
        else:
            factors.append(f"Small historical sample size ({total_experiments} experiments)")

        if avg_similarity >= 0.75:
            score += 0.15
            factors.append(f"High parameter similarity ({avg_similarity})")

        if hindsight_count > 0:
            score += 0.1
            factors.append(f"Supported by {hindsight_count} recalled Hindsight memories")

        if contradiction_count > 0:
            score -= 0.2
            factors.append("Contradictory historical outcomes reduce confidence")

        score = round(max(0.1, min(0.95, score)), 2)
        level = "High" if score >= 0.75 else ("Medium" if score >= 0.45 else "Low")

        return {
            "score": score,
            "level": level,
            "explanation": f"Confidence is rated {level} based on {len(factors)} historical evidence signals.",
            "key_factors": factors
        }

evidence_analyzer = EvidenceAnalyzer()
