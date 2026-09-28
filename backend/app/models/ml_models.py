import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class ExperimentEmbedding(Base):
    __tablename__ = "experiment_embeddings"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False, index=True)
    embedding_type = Column(String, default="description", index=True) # description, reaction, observation, failure
    embedding_vector = Column(JSON, nullable=False) # Serialized list of floats for pgvector/JSON fallback
    model_version = Column(String, default="all-MiniLM-L6-v2")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    experiment = relationship("Experiment", back_populates="embeddings")

class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    statement = Column(Text, nullable=False)
    status = Column(String, default="open", index=True) # open, supported, refuted, inconclusive
    supporting_experiments = Column(JSON, nullable=True)
    refuting_experiments = Column(JSON, nullable=True)
    created_by = Column(String, ForeignKey("researchers.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
