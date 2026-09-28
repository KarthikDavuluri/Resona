from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class PatternCreate(BaseModel):
    cluster_name: str
    cluster_type: str = "failure_pattern"
    description: str
    supporting_experiment_ids: List[str]
    confidence: float = 0.8
    meta_info: Optional[Dict[str, Any]] = None

class PatternResponse(BaseModel):
    id: str
    cluster_name: str
    cluster_type: str
    description: str
    algorithm: str
    supporting_experiments_count: float
    confidence: float
    supporting_experiment_ids: Optional[Any] = None
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True
