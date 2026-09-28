import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base

class FailureRecord(Base):
    __tablename__ = "failure_records"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), unique=True, nullable=False, index=True)
    failure_category = Column(String, nullable=False, index=True) # parameter, process, material, equipment, unexpected_observation
    description = Column(Text, nullable=False)
    severity = Column(String, default="moderate", index=True) # minor, moderate, severe, catastrophic
    evidence = Column(Text, nullable=True)
    researcher_interpretation = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.8)
    cluster_id = Column(String, ForeignKey("pattern_clusters.id"), nullable=True, index=True)
    meta_info = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    experiment = relationship("Experiment", back_populates="failure_record")
    cluster = relationship("PatternCluster", back_populates="failures")

class PatternCluster(Base):
    __tablename__ = "pattern_clusters"

    id = Column(String, primary_key=True, index=True)
    cluster_name = Column(String, nullable=False, index=True)
    cluster_type = Column(String, default="failure_pattern", index=True) # failure_pattern, success_pattern, reproducibility
    description = Column(Text, nullable=False)
    algorithm = Column(String, default="dbscan")
    supporting_experiments_count = Column(Float, default=0)
    confidence = Column(Float, default=0.8)
    supporting_experiment_ids = Column(JSON, nullable=True)
    meta_info = Column(JSON, nullable=True)
    
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    failures = relationship("FailureRecord", back_populates="cluster")
