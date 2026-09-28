from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class QueryRequest(BaseModel):
    query: str
    parameters: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None
    memory_mode: Optional[bool] = True # Memory ON vs Memory OFF evaluation flag

class ProposalReviewRequest(BaseModel):
    experiment_name: str
    description: Optional[str] = None
    proposed_parameters: Dict[str, Any]
    project_id: Optional[str] = None
    researcher_id: Optional[str] = None
    memory_mode: Optional[bool] = True # Memory ON / Memory OFF

class CounterfactualOption(BaseModel):
    original_config: Dict[str, Any]
    suggested_modification: Dict[str, Any]
    reasoning: str
    supporting_experiments: List[str]
    historical_evidence_summary: str
    uncertainty_level: str
    confidence_score: float

class DecisionSupportSummary(BaseModel):
    total_similar_experiments: int
    successful_experiments: int
    failed_experiments: int
    outcome_distribution: Dict[str, int]
    similarity_score: float
    temporal_relevance: float
    contradiction_count: int
    evidence_coverage: float

class ConfidenceExplanation(BaseModel):
    score: float
    level: str # High, Medium, Low
    explanation: str
    key_factors: List[str]

class ProvenanceItem(BaseModel):
    source_type: str # RESONA, ORD, Hindsight, ResearcherFeedback
    source_id: str
    retrieval_method: str # sql, fts, pg_trgm, vector, hindsight_recall
    relevance_score: float

class QueryResponse(BaseModel):
    query: str
    memory_mode: str # MEMORY_ON or MEMORY_OFF
    decision_support: DecisionSupportSummary
    confidence: ConfidenceExplanation
    counterfactuals: List[CounterfactualOption]
    supporting_evidence: List[Dict[str, Any]]
    hindsight_memories: List[Dict[str, Any]]
    contradictions: List[Dict[str, Any]]
    candidate_directives: List[Dict[str, Any]]
    provenance: List[ProvenanceItem]
    latency_ms: float

class ProposalReviewResponse(BaseModel):
    proposal: Dict[str, Any]
    memory_mode: str
    similar_experiments_count: int
    historical_failures_count: int
    historical_successes_count: int
    decision_support: DecisionSupportSummary
    confidence: ConfidenceExplanation
    counterfactual_suggestions: List[CounterfactualOption]
    hindsight_recalled_experience: List[Dict[str, Any]]
    provenance: List[ProvenanceItem]
    recommendation: str
    uncertainty_note: str
