import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class MemoryEvent(Base):
    __tablename__ = "memory_events"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=True, index=True)
    event_type = Column(String, nullable=False, index=True) # retain, recall, reflect
    hindsight_memory_id = Column(String, nullable=True, index=True)
    content = Column(Text, nullable=False)
    tags = Column(JSON, nullable=True)
    meta_info = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    experiment = relationship("Experiment", back_populates="memory_events")

class MentalModel(Base):
    __tablename__ = "mental_models"

    id = Column(String, primary_key=True, index=True)
    model_name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    supporting_evidence = Column(JSON, nullable=True) # list of experiment IDs and observations
    confidence = Column(Float, default=0.7)
    status = Column(String, default="active", index=True) # candidate, active, superseded, deprecated
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Directive(Base):
    __tablename__ = "directives"

    id = Column(String, primary_key=True, index=True)
    directive_text = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    status = Column(String, default="candidate", index=True) # candidate, approved, rejected, deprecated
    confidence = Column(Float, default=0.8)
    supporting_experiment_ids = Column(JSON, nullable=True)
    approved_by = Column(String, ForeignKey("researchers.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id = Column(String, primary_key=True, index=True)
    query_id = Column(String, nullable=True, index=True)
    source_type = Column(String, nullable=False, index=True) # RESONA, ORD, Hindsight, ResearcherFeedback
    source_id = Column(String, nullable=False, index=True)
    relevance_score = Column(Float, default=0.0)
    temporal_relevance = Column(Float, default=1.0)
    retrieval_method = Column(String, default="hybrid") # sql, fts, pg_trgm, vector, hindsight_recall
    evidence_payload = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Counterfactual(Base):
    __tablename__ = "counterfactuals"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=True, index=True)
    original_config = Column(JSON, nullable=False)
    suggested_modification = Column(JSON, nullable=False)
    reasoning = Column(Text, nullable=False)
    supporting_experiment_ids = Column(JSON, nullable=True)
    historical_evidence_summary = Column(Text, nullable=True)
    uncertainty_level = Column(String, default="medium")
    confidence_score = Column(Float, default=0.75)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
