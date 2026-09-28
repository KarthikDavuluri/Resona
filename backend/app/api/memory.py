from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.memory import (
    MemoryRetainRequest, MemoryRetainResponse,
    MemoryRecallRequest, MemoryRecallResponse,
    MemoryReflectRequest, MemoryReflectResponse,
    DirectiveApproveRequest, MentalModelResponse
)
from backend.app.services.hindsight_service import hindsight_service
from backend.app.services.pattern_service import pattern_service
from backend.app.models.memory import MentalModel, Directive

router = APIRouter(prefix="/memory", tags=["Experiential Memory"])

@router.post("/retain", response_model=MemoryRetainResponse)
def retain_memory(req: MemoryRetainRequest):
    res = hindsight_service.retain(req.dict())
    return {
        "memory_id": res["memory_id"],
        "status": res["status"],
        "hindsight_status": res["hindsight_status"],
        "message": res["message"],
        "timestamp": res["timestamp"]
    }

@router.post("/recall", response_model=MemoryRecallResponse)
def recall_memory(req: MemoryRecallRequest):
    memories = hindsight_service.recall(query=req.query, parameters=req.parameters, top_k=req.top_k)
    scores = [m.get("relevance_score", 0.0) for m in memories]
    provenance = [
        {
            "memory_id": m.get("memory_id"),
            "source": m.get("hindsight_mode", "hindsight_service"),
            "relevance_score": m.get("relevance_score", 0.0)
        }
        for m in memories
    ]
    return {
        "query": req.query,
        "memories": memories,
        "relevance_scores": scores,
        "provenance": provenance,
        "memory_mode": hindsight_service.get_status()
    }

@router.post("/reflect", response_model=MemoryReflectResponse)
def reflect_memory(req: MemoryReflectRequest, db: Session = Depends(get_db)):
    reflection = hindsight_service.reflect(domain=req.domain or "catalysis", experiment_ids=req.experiment_ids)
    return reflection

@router.get("/models", response_model=List[MentalModelResponse])
def get_mental_models(db: Session = Depends(get_db)):
    return db.query(MentalModel).all()

@router.post("/directives/{directive_id}/approve")
def approve_directive(directive_id: str, req: DirectiveApproveRequest, db: Session = Depends(get_db)):
    updated = pattern_service.approve_directive(
        db=db,
        directive_id=directive_id,
        approved_by=req.approved_by,
        status=req.status
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "DIRECTIVE_NOT_FOUND", "message": f"Directive '{directive_id}' does not exist."}
        )
    return {
        "id": updated.id,
        "directive": updated.directive_text,
        "status": updated.status,
        "approved_by": updated.approved_by,
        "updated_at": updated.updated_at
    }
