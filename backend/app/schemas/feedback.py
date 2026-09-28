from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class FeedbackCreate(BaseModel):
    researcher_id: str
    target_type: str = Field(..., description="experiment, proposal_review, directive, pattern")
    target_id: str
    rating: str = Field(..., description="useful, not_useful, correct, incorrect, partially_correct")
    comments: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    researcher_id: str
    target_type: str
    target_id: str
    rating: str
    score: float
    comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
