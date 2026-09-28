import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False, index=True) # CREATE, UPDATE, DELETE, LOG_OUTCOME, APPROVE_DIRECTIVE
    entity_type = Column(String, nullable=False, index=True) # Experiment, Directive, Pattern, Memory
    entity_id = Column(String, nullable=True, index=True)
    source = Column(String, default="API") # API, Worker, System
    is_system_generated = Column(String, default="false") # "true" or "false"
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class ResearcherFeedback(Base):
    __tablename__ = "researcher_feedback"

    id = Column(String, primary_key=True, index=True)
    researcher_id = Column(String, ForeignKey("researchers.id"), nullable=False, index=True)
    target_type = Column(String, nullable=False, index=True) # experiment, proposal_review, directive, pattern
    target_id = Column(String, nullable=False, index=True)
    rating = Column(String, nullable=False, index=True) # useful, not_useful, correct, incorrect, partially_correct
    score = Column(Float, default=1.0)
    comments = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    researcher = relationship("Researcher", back_populates="feedbacks")
