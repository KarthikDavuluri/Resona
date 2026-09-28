import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text, or_
from backend.app.models.experiment import Experiment, ExperimentParameter, ExperimentObservation, ExperimentOutcome
from backend.app.models.failure import FailureRecord
from backend.app.services.embedding_service import embedding_service
from backend.app.services.hindsight_service import hindsight_service

logger = logging.getLogger("resona.hybrid_retrieval")

class HybridRetrievalEngine:
    """
    Combines 5 search signals:
    1. Structured PostgreSQL parameter filtering
    2. PostgreSQL Full-Text Search (FTS)
    3. Trigram similarity (pg_trgm)
    4. pgvector semantic vector similarity
    5. Hindsight Memory Recall
    """

    def search(
        self,
        db: Session,
        query_text: str,
        parameters: Optional[Dict[str, Any]] = None,
        memory_mode: bool = True,
        top_k: int = 10
    ) -> Dict[str, Any]:
        
        parameters = parameters or {}
        retrieved_items: Dict[str, Dict[str, Any]] = {}
        provenance_records: List[Dict[str, Any]] = []
        hindsight_memories: List[Dict[str, Any]] = []

        # 1. Structured SQL parameter filtering
        structured_matches = self._search_structured(db, parameters)
        for exp in structured_matches:
            exp_id = exp.id
            score = 0.85
            retrieved_items[exp_id] = {
                "experiment": exp,
                "score": score,
                "signals": ["structured_sql"]
            }
            provenance_records.append({
                "source_type": exp.source_type,
                "source_id": exp.id,
                "retrieval_method": "sql_parameter_filter",
                "relevance_score": score
            })

        # 2. Text Search / Trigram search over experiment name & description
        text_matches = self._search_text_and_trigram(db, query_text)
        for exp, match_score in text_matches:
            exp_id = exp.id
            if exp_id in retrieved_items:
                retrieved_items[exp_id]["score"] = max(retrieved_items[exp_id]["score"], match_score)
                retrieved_items[exp_id]["signals"].append("fts_trigram")
            else:
                retrieved_items[exp_id] = {
                    "experiment": exp,
                    "score": match_score,
                    "signals": ["fts_trigram"]
                }
            provenance_records.append({
                "source_type": exp.source_type,
                "source_id": exp.id,
                "retrieval_method": "fts_trigram",
                "relevance_score": match_score
            })

        # 3. Vector Similarity
        query_vec = embedding_service.encode(query_text)
        vector_matches = self._search_vector(db, query_vec)
        for exp, sim_score in vector_matches:
            exp_id = exp.id
            if exp_id in retrieved_items:
                retrieved_items[exp_id]["score"] = max(retrieved_items[exp_id]["score"], sim_score)
                retrieved_items[exp_id]["signals"].append("pgvector_semantic")
            else:
                retrieved_items[exp_id] = {
                    "experiment": exp,
                    "score": sim_score,
                    "signals": ["pgvector_semantic"]
                }
            provenance_records.append({
                "source_type": exp.source_type,
                "source_id": exp.id,
                "retrieval_method": "pgvector_semantic",
                "relevance_score": sim_score
            })

        # 4. Hindsight Recall Signal (Only if memory_mode is True)
        if memory_mode:
            hindsight_recalled = hindsight_service.recall(query=query_text, parameters=parameters, top_k=5)
            hindsight_memories = hindsight_recalled
            for mem in hindsight_recalled:
                score = mem.get("relevance_score", 0.75)
                provenance_records.append({
                    "source_type": "HindsightMemory",
                    "source_id": mem.get("memory_id", "mem_unk"),
                    "retrieval_method": "hindsight_recall",
                    "relevance_score": score
                })

        # Sort combined experiment results
        ranked_experiments = sorted(retrieved_items.values(), key=lambda x: x["score"], reverse=True)[:top_k]

        return {
            "ranked_results": ranked_experiments,
            "hindsight_memories": hindsight_memories,
            "provenance": provenance_records
        }

    def _search_structured(self, db: Session, parameters: Dict[str, Any]) -> List[Experiment]:
        if not parameters:
            return db.query(Experiment).order_by(Experiment.created_at.desc()).limit(5).all()

        query = db.query(Experiment).join(ExperimentParameter)
        filters = []
        for name, val in parameters.items():
            filters.append(
                (ExperimentParameter.parameter_name.ilike(f"%{name}%")) &
                (ExperimentParameter.parameter_value.ilike(f"%{str(val)}%"))
            )
        if filters:
            query = query.filter(or_(*filters))
        return query.limit(10).all()

    def _search_text_and_trigram(self, db: Session, query_text: str) -> List[tuple]:
        if not query_text:
            return []
        
        keywords = query_text.split()
        results = []
        for kw in keywords[:3]:
            exps = db.query(Experiment).filter(
                or_(
                    Experiment.experiment_name.ilike(f"%{kw}%"),
                    Experiment.description.ilike(f"%{kw}%")
                )
            ).limit(5).all()
            for exp in exps:
                results.append((exp, 0.75))
        return results

    def _search_vector(self, db: Session, query_vec: List[float]) -> List[tuple]:
        all_exps = db.query(Experiment).all()
        scored = []
        for exp in all_exps:
            # Generate or retrieve embedding
            desc_text = f"{exp.experiment_name} {exp.description or ''}"
            exp_vec = embedding_service.encode(desc_text)
            sim = embedding_service.cosine_similarity(query_vec, exp_vec)
            scored.append((exp, round(sim, 3)))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:5]

hybrid_retrieval = HybridRetrievalEngine()
