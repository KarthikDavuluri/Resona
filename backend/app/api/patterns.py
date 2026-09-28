from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.pattern import PatternCreate, PatternResponse
from backend.app.services.pattern_service import pattern_service
from backend.app.models.failure import PatternCluster

router = APIRouter(prefix="/patterns", tags=["Pattern Discovery"])

@router.get("", response_model=List[PatternResponse])
def get_patterns(db: Session = Depends(get_db)):
    return db.query(PatternCluster).order_by(PatternCluster.last_seen.desc()).all()

@router.post("", response_model=PatternResponse)
def discover_patterns(db: Session = Depends(get_db)):
    res = pattern_service.discover_patterns(db=db)
    clusters = res["clusters"]
    return clusters[0] if clusters else {
        "id": "pat_empty",
        "cluster_name": "No Patterns",
        "cluster_type": "none",
        "description": "No patterns discovered yet.",
        "algorithm": "dbscan",
        "supporting_experiments_count": 0,
        "confidence": 0.0,
        "supporting_experiment_ids": [],
        "first_seen": "2024-01-01T00:00:00",
        "last_seen": "2024-01-01T00:00:00"
    }
