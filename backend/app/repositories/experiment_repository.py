import uuid
import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.experiment import Experiment, ExperimentParameter, ExperimentObservation, ExperimentOutcome
from backend.app.models.failure import FailureRecord
from backend.app.models.audit import AuditLog, ResearcherFeedback
from backend.app.schemas.experiment import ExperimentCreate, OutcomeCreate, FailureCreate

class ExperimentRepository:

    @staticmethod
    def create_experiment(db: Session, data: ExperimentCreate) -> Experiment:
        exp_id = f"exp_{uuid.uuid4().hex[:10]}"
        experiment = Experiment(
            id=exp_id,
            project_id=data.project_id,
            researcher_id=data.researcher_id,
            experiment_name=data.experiment_name,
            description=data.description,
            experiment_type=data.experiment_type,
            reaction_smiles=data.reaction_smiles,
            status="proposed",
            meta_info=data.meta_info or {}
        )
        db.add(experiment)
        db.flush()

        # Add parameters
        if data.parameters:
            for p in data.parameters:
                param_id = f"param_{uuid.uuid4().hex[:8]}"
                param = ExperimentParameter(
                    id=param_id,
                    experiment_id=exp_id,
                    parameter_name=p.parameter_name,
                    parameter_value=str(p.parameter_value),
                    numeric_value=p.numeric_value,
                    unit=p.unit,
                    parameter_type=p.parameter_type or "condition",
                    raw_data=p.raw_data or {}
                )
                db.add(param)

        # Add observations
        if data.observations:
            for obs in data.observations:
                obs_id = f"obs_{uuid.uuid4().hex[:8]}"
                observation = ExperimentObservation(
                    id=obs_id,
                    experiment_id=exp_id,
                    observation_type=obs.observation_type,
                    observation_text=obs.observation_text,
                    observed_by=obs.observed_by,
                    meta_info=obs.meta_info or {}
                )
                db.add(observation)

        # Log Audit
        audit = AuditLog(
            id=f"audit_{uuid.uuid4().hex[:10]}",
            user_id=data.researcher_id,
            action="CREATE_EXPERIMENT",
            entity_type="Experiment",
            entity_id=exp_id,
            source="API",
            is_system_generated="false",
            new_state={"experiment_name": data.experiment_name, "project_id": data.project_id}
        )
        db.add(audit)

        db.commit()
        db.refresh(experiment)
        return experiment

    @staticmethod
    def get_experiment_by_id(db: Session, exp_id: str) -> Optional[Experiment]:
        return db.query(Experiment).filter(Experiment.id == exp_id).first()

    @staticmethod
    def list_experiments(db: Session, skip: int = 0, limit: int = 50) -> List[Experiment]:
        return db.query(Experiment).order_by(Experiment.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def log_outcome(db: Session, exp_id: str, outcome_data: OutcomeCreate) -> Optional[ExperimentOutcome]:
        experiment = db.query(Experiment).filter(Experiment.id == exp_id).first()
        if not experiment:
            return None

        experiment.status = outcome_data.status
        experiment.updated_at = datetime.datetime.utcnow()

        outcome = db.query(ExperimentOutcome).filter(ExperimentOutcome.experiment_id == exp_id).first()
        if not outcome:
            outcome = ExperimentOutcome(
                id=f"out_{uuid.uuid4().hex[:10]}",
                experiment_id=exp_id,
                status=outcome_data.status,
                yield_percentage=outcome_data.yield_percentage,
                purity_percentage=outcome_data.purity_percentage,
                quality_metrics=outcome_data.quality_metrics or {},
                measurements=outcome_data.measurements or {},
                notes=outcome_data.notes,
                researcher_interpretation=outcome_data.researcher_interpretation,
                uncertainty_level=outcome_data.uncertainty_level
            )
            db.add(outcome)
        else:
            outcome.status = outcome_data.status
            outcome.yield_percentage = outcome_data.yield_percentage
            outcome.notes = outcome_data.notes

        audit = AuditLog(
            id=f"audit_{uuid.uuid4().hex[:10]}",
            user_id=experiment.researcher_id,
            action="LOG_OUTCOME",
            entity_type="ExperimentOutcome",
            entity_id=exp_id,
            source="API",
            is_system_generated="false",
            new_state={"status": outcome_data.status, "yield": outcome_data.yield_percentage}
        )
        db.add(audit)

        db.commit()
        db.refresh(outcome)
        return outcome

    @staticmethod
    def log_failure(db: Session, exp_id: str, failure_data: FailureCreate) -> Optional[FailureRecord]:
        experiment = db.query(Experiment).filter(Experiment.id == exp_id).first()
        if not experiment:
            return None

        failure = db.query(FailureRecord).filter(FailureRecord.experiment_id == exp_id).first()
        if not failure:
            failure = FailureRecord(
                id=f"fail_{uuid.uuid4().hex[:10]}",
                experiment_id=exp_id,
                failure_category=failure_data.failure_category,
                description=failure_data.description,
                severity=failure_data.severity,
                evidence=failure_data.evidence,
                researcher_interpretation=failure_data.researcher_interpretation,
                confidence_score=failure_data.confidence_score
            )
            db.add(failure)
        else:
            failure.description = failure_data.description
            failure.failure_category = failure_data.failure_category

        db.commit()
        db.refresh(failure)
        return failure

experiment_repository = ExperimentRepository()
