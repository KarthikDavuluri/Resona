from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ParameterSchema(BaseModel):
    parameter_name: str
    parameter_value: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    parameter_type: Optional[str] = "condition"
    raw_data: Optional[Dict[str, Any]] = None

class ObservationSchema(BaseModel):
    observation_type: str = "visual"
    observation_text: str
    observed_by: Optional[str] = None
    meta_info: Optional[Dict[str, Any]] = None

class ExperimentCreate(BaseModel):
    project_id: str
    researcher_id: str
    experiment_name: str
    description: Optional[str] = None
    experiment_type: str = "reaction"
    reaction_smiles: Optional[str] = None
    parameters: Optional[List[ParameterSchema]] = []
    observations: Optional[List[ObservationSchema]] = []
    meta_info: Optional[Dict[str, Any]] = None

class ExperimentUpdate(BaseModel):
    experiment_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    meta_info: Optional[Dict[str, Any]] = None

class OutcomeCreate(BaseModel):
    status: str = Field(..., description="success, failure, partial, unknown")
    yield_percentage: Optional[float] = None
    purity_percentage: Optional[float] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    measurements: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    researcher_interpretation: Optional[str] = None
    uncertainty_level: str = "low"

class FailureCreate(BaseModel):
    failure_category: str = Field(..., description="parameter, process, material, equipment, unexpected_observation")
    description: str
    severity: str = "moderate"
    evidence: Optional[str] = None
    researcher_interpretation: Optional[str] = None
    confidence_score: float = 0.8

class OutcomeResponse(BaseModel):
    id: str
    experiment_id: str
    status: str
    yield_percentage: Optional[float] = None
    purity_percentage: Optional[float] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    researcher_interpretation: Optional[str] = None
    uncertainty_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class FailureResponse(BaseModel):
    id: str
    experiment_id: str
    failure_category: str
    description: str
    severity: str
    evidence: Optional[str] = None
    confidence_score: float
    cluster_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExperimentResponse(BaseModel):
    id: str
    project_id: str
    researcher_id: str
    experiment_name: str
    description: Optional[str] = None
    experiment_type: str
    status: str
    reaction_smiles: Optional[str] = None
    source_type: str
    source_id: Optional[str] = None
    is_synthetic: bool
    created_at: datetime
    updated_at: datetime
    parameters: List[ParameterSchema] = []
    observations: List[ObservationSchema] = []
    outcome: Optional[OutcomeResponse] = None
    failure_record: Optional[FailureResponse] = None

    class Config:
        from_attributes = True
