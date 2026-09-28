from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    source: str
    is_system_generated: str
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True
