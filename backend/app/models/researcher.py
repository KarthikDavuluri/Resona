import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Researcher(Base):
    __tablename__ = "researchers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    institution = Column(String, nullable=True)
    domain_expertise = Column(JSON, nullable=True) # e.g. ["catalysis", "polymers", "organic_synthesis"]
    
    # Quantitative contribution/reputation weighting
    total_experiments = Column(Integer, default=0)
    validated_observations = Column(Integer, default=0)
    approved_directives = Column(Integer, default=0)
    rejected_directives = Column(Integer, default=0)
    reputation_score = Column(Float, default=1.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    experiments = relationship("Experiment", back_populates="researcher")
    feedbacks = relationship("ResearcherFeedback", back_populates="researcher")
