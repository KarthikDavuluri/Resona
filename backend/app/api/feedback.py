import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.feedback import FeedbackCreate, FeedbackResponse
from backend.app.models.audit import ResearcherFeedback
from backend.app.models.researcher import Researcher

router = APIRouter(prefix="/feedback", tags=["Researcher Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    researcher = db.query(Researcher).filter(Researcher.id == data.researcher_id).first()
    if not researcher:
        # Create lightweight researcher record if absent
        researcher = Researcher(
            id=data.researcher_id,
            name="Contributing Researcher",
            email=f"{data.researcher_id}@resona.ai"
        )
        db.add(researcher)

    # Score calculation
    score_map = {
        "useful": 1.0,
        "correct": 1.0,
        "partially_correct": 0.5,
        "not_useful": -0.5,
        "incorrect": -1.0
    }
    score = score_map.get(data.rating.lower(), 0.0)

    feedback = ResearcherFeedback(
        id=f"fb_{uuid.uuid4().hex[:10]}",
        researcher_id=data.researcher_id,
        target_type=data.target_type,
        target_id=data.target_id,
        rating=data.rating,
        score=score,
        comments=data.comments
    )
    db.add(feedback)

    # Update researcher total experiments / reputation stats
    if score > 0:
        researcher.validated_observations += 1
        researcher.reputation_score = round(researcher.reputation_score + 0.05, 2)
    elif score < 0:
        researcher.reputation_score = round(max(0.1, researcher.reputation_score - 0.05), 2)

    db.commit()
    db.refresh(feedback)
    return feedback
