from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class MemoryRetainRequest(BaseModel):
    experiment_id: Optional[str] = None
    experiment_context: str
    parameters: Optional[Dict[str, Any]] = None
    observations: Optional[List[str]] = None
    outcome: Optional[str] = None
    failure_reason: Optional[str] = None
    successful_alternatives: Optional[List[str]] = None
    researcher_feedback: Optional[str] = None
    lessons_learned: Optional[List[str]] = None
    tags: Optional[List[str]] = None

class MemoryRetainResponse(BaseModel):
    memory_id: str
    status: str
    hindsight_status: str
    message: str
    timestamp: datetime

class MemoryRecallRequest(BaseModel):
    query: str
    parameters: Optional[Dict[str, Any]] = None
    top_k: int = 5
    min_confidence: float = 0.5

class MemoryRecallResponse(BaseModel):
    query: str
    memories: List[Dict[str, Any]]
    relevance_scores: List[float]
    provenance: List[Dict[str, Any]]
    memory_mode: str

class MemoryReflectRequest(BaseModel):
    domain: Optional[str] = "catalysis"
    experiment_ids: Optional[List[str]] = None
    min_cluster_size: int = 2

class MemoryReflectResponse(BaseModel):
    patterns: List[Dict[str, Any]]
    mental_models: List[Dict[str, Any]]
    candidate_directives: List[Dict[str, Any]]
    contradictions: List[Dict[str, Any]]
    timestamp: datetime

class DirectiveApproveRequest(BaseModel):
    approved_by: str
    status: str = Field(..., description="approved, rejected, deprecated")
    notes: Optional[str] = None

class MentalModelResponse(BaseModel):
    id: str
    model_name: str
    description: str
    supporting_evidence: Optional[Any] = None
    confidence: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
