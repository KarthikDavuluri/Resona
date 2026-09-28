import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    researcher_id = Column(String, ForeignKey("researchers.id"), nullable=False, index=True)
    experiment_name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    experiment_type = Column(String, default="reaction", index=True) # e.g., reaction, synthesis, measurement
    status = Column(String, default="proposed", index=True) # proposed, running, completed, cancelled
    
    # Flexible scientific metadata
    reaction_smiles = Column(String, nullable=True, index=True)
    source_type = Column(String, default="RESONA", index=True) # RESONA, ORD, Synthetic
    source_id = Column(String, nullable=True, index=True)
    is_synthetic = Column(Boolean, default=False, index=True)
    
    # Additional JSON attributes for flexible scientific parameters
    meta_info = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="experiments")
    researcher = relationship("Researcher", back_populates="experiments")
    parameters = relationship("ExperimentParameter", back_populates="experiment", cascade="all, delete-orphan")
    observations = relationship("ExperimentObservation", back_populates="experiment", cascade="all, delete-orphan")
    outcome = relationship("ExperimentOutcome", back_populates="experiment", uselist=False, cascade="all, delete-orphan")
    failure_record = relationship("FailureRecord", back_populates="experiment", uselist=False, cascade="all, delete-orphan")
    embeddings = relationship("ExperimentEmbedding", back_populates="experiment", cascade="all, delete-orphan")
    memory_events = relationship("MemoryEvent", back_populates="experiment", cascade="all, delete-orphan")

class ExperimentParameter(Base):
    __tablename__ = "experiment_parameters"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False, index=True)
    parameter_name = Column(String, nullable=False, index=True) # e.g. temperature, pressure, catalyst, solvent
    parameter_value = Column(String, nullable=False) # e.g. "180", "Pd(PPh3)4", "DMF"
    numeric_value = Column(Float, nullable=True, index=True)
    unit = Column(String, nullable=True) # e.g. degC, bar, mol/L, %
    parameter_type = Column(String, default="condition", index=True) # condition, reactant, product, solvent, catalyst
    raw_data = Column(JSON, nullable=True)

    experiment = relationship("Experiment", back_populates="parameters")

class ExperimentObservation(Base):
    __tablename__ = "experiment_observations"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False, index=True)
    observation_type = Column(String, default="visual", index=True) # visual, analytical, unexpected
    observation_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    observed_by = Column(String, nullable=True)
    meta_info = Column(JSON, nullable=True)

    experiment = relationship("Experiment", back_populates="observations")

class ExperimentOutcome(Base):
    __tablename__ = "experiment_outcomes"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), unique=True, nullable=False, index=True)
    status = Column(String, nullable=False, index=True) # success, failure, partial, unknown
    yield_percentage = Column(Float, nullable=True, index=True)
    purity_percentage = Column(Float, nullable=True)
    quality_metrics = Column(JSON, nullable=True)
    measurements = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    researcher_interpretation = Column(Text, nullable=True)
    uncertainty_level = Column(String, default="low") # low, medium, high
    derived_label = Column(Boolean, default=False)
    derivation_method = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    experiment = relationship("Experiment", back_populates="outcome")
