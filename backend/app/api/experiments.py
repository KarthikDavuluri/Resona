from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.repositories.experiment_repository import experiment_repository
from backend.app.schemas.experiment import (
    ExperimentCreate, ExperimentUpdate, ExperimentResponse,
    OutcomeCreate, OutcomeResponse, FailureCreate, FailureResponse
)
from backend.app.workers.memory_worker import memory_worker
from backend.app.workers.redis_stream import redis_broker

router = APIRouter(prefix="/experiments", tags=["Experiments"])

@router.get("", response_model=List[ExperimentResponse])
def list_experiments(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return experiment_repository.list_experiments(db=db, skip=skip, limit=limit)

@router.post("", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED)
def create_experiment(data: ExperimentCreate, db: Session = Depends(get_db)):
    exp = experiment_repository.create_experiment(db=db, data=data)
    redis_broker.publish_event("experiment.events", {"action": "CREATED", "experiment_id": exp.id})
    return exp

@router.get("/{exp_id}", response_model=ExperimentResponse)
def get_experiment(exp_id: str, db: Session = Depends(get_db)):
    exp = experiment_repository.get_experiment_by_id(db=db, exp_id=exp_id)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "EXPERIMENT_NOT_FOUND", "message": f"Experiment '{exp_id}' does not exist."}
        )
    return exp

@router.put("/{exp_id}", response_model=ExperimentResponse)
def update_experiment(exp_id: str, data: ExperimentUpdate, db: Session = Depends(get_db)):
    exp = experiment_repository.get_experiment_by_id(db=db, exp_id=exp_id)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "EXPERIMENT_NOT_FOUND", "message": f"Experiment '{exp_id}' does not exist."}
        )
    if data.experiment_name:
        exp.experiment_name = data.experiment_name
    if data.description:
        exp.description = data.description
    if data.status:
        exp.status = data.status
    
    db.commit()
    db.refresh(exp)
    return exp

@router.post("/{exp_id}/outcome", response_model=OutcomeResponse)
def log_experiment_outcome(exp_id: str, outcome_data: OutcomeCreate, db: Session = Depends(get_db)):
    exp = experiment_repository.get_experiment_by_id(db=db, exp_id=exp_id)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "EXPERIMENT_NOT_FOUND", "message": f"Experiment '{exp_id}' does not exist."}
        )

    outcome = experiment_repository.log_outcome(db=db, exp_id=exp_id, outcome_data=outcome_data)
    
    # Trigger Async Memory & Embedding Worker
    memory_worker.process_experiment_outcome(db=db, experiment_id=exp_id)
    redis_broker.publish_event("memory.events", {"action": "OUTCOME_LOGGED", "experiment_id": exp_id})

    return outcome

@router.post("/{exp_id}/failure", response_model=FailureResponse)
def log_experiment_failure(exp_id: str, failure_data: FailureCreate, db: Session = Depends(get_db)):
    exp = experiment_repository.get_experiment_by_id(db=db, exp_id=exp_id)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "EXPERIMENT_NOT_FOUND", "message": f"Experiment '{exp_id}' does not exist."}
        )

    failure = experiment_repository.log_failure(db=db, exp_id=exp_id, failure_data=failure_data)
    redis_broker.publish_event("analytics.events", {"action": "FAILURE_LOGGED", "experiment_id": exp_id})
    return failure
