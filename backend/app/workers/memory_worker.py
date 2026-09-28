import logging
import uuid
import datetime
from sqlalchemy.orm import Session
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.embedding_service import embedding_service
from backend.app.models.experiment import Experiment
from backend.app.models.ml_models import ExperimentEmbedding
from backend.app.models.memory import MemoryEvent

logger = logging.getLogger("resona.memory_worker")

class MemoryWorker:
    """
    Consumes experiment outcome events:
    1. Triggers Hindsight RETAIN to store persistent experiential memory.
    2. Generates sentence-transformer embedding vectors.
    3. Stores embedding vectors in PostgreSQL pgvector.
    """

    def process_experiment_outcome(self, db: Session, experiment_id: str) -> bool:
        exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
        if not exp:
            logger.error(f"MemoryWorker: Experiment {experiment_id} not found.")
            return False

        # Build rich scientific context
        params_dict = {p.parameter_name: p.parameter_value for p in exp.parameters}
        obs_list = [o.observation_text for o in exp.observations] if hasattr(exp, 'observations') and exp.observations else []
        outcome_status = exp.outcome.status if exp.outcome else "unknown"
        failure_reason = exp.failure_record.description if exp.failure_record else "N/A"

        payload = {
            "experiment_id": exp.id,
            "experiment_context": f"{exp.experiment_name}: {exp.description or ''}",
            "parameters": params_dict,
            "observations": obs_list,
            "outcome": outcome_status,
            "failure_reason": failure_reason,
            "tags": [exp.experiment_type, exp.source_type]
        }

        # 1. Hindsight RETAIN
        retain_res = hindsight_service.retain(payload)
        
        # Log Memory Event
        mem_event = MemoryEvent(
            id=f"me_{uuid.uuid4().hex[:10]}",
            experiment_id=exp.id,
            event_type="retain",
            hindsight_memory_id=retain_res.get("memory_id"),
            content=f"Experience retained. Status: {retain_res.get('status')}",
            meta_info=retain_res
        )
        db.add(mem_event)

        # 2. Embedding Generation
        embed_text = f"{exp.experiment_name} {exp.description or ''} {outcome_status} {failure_reason}"
        vec = embedding_service.encode(embed_text)

        embedding_rec = ExperimentEmbedding(
            id=f"emb_{uuid.uuid4().hex[:10]}",
            experiment_id=exp.id,
            embedding_type="description",
            embedding_vector=vec,
            model_version=embedding_service.model_name
        )
        db.add(embedding_rec)

        db.commit()
        logger.info(f"MemoryWorker: Retained memory & generated embeddings for experiment {exp.id}.")
        return True

memory_worker = MemoryWorker()
