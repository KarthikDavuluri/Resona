export interface ParameterInput {
  parameter_name: string;
  parameter_value: string;
  numeric_value?: number;
  unit?: string;
}

export interface ExperimentCreate {
  project_id: string;
  experiment_name: string;
  experiment_type?: string;
  description?: string;
  researcher_id?: string;
  parameters: ParameterInput[];
}

export interface ExperimentOutcomeCreate {
  status: 'success' | 'failure' | 'partial' | string;
  yield_percentage?: number;
  notes?: string;
  uncertainty_level?: 'low' | 'medium' | 'high' | string;
  failure_category?: string;
  failure_description?: string;
}
export type OutcomeCreate = ExperimentOutcomeCreate;

export interface ExperimentParameter {
  id: string;
  experiment_id: string;
  parameter_name: string;
  parameter_value: string;
  numeric_value?: number;
  unit?: string;
}

export interface FailureClassification {
  id: string;
  experiment_id: string;
  failure_category: string;
  primary_failure_category?: string;
  failure_description?: string;
  description: string;
  severity: string;
  preventable: boolean;
  root_cause?: string;
  created_at?: string;
}
export type FailureCreate = Partial<FailureClassification> & { failure_category: string };
export type FailureResponse = FailureClassification;

export interface ExperimentOutcome {
  id: string;
  experiment_id: string;
  status: string;
  yield_percentage?: number;
  notes?: string;
  uncertainty_level: string;
  logged_at: string;
  failure_classification?: FailureClassification;
}
export type OutcomeResponse = ExperimentOutcome;

export interface Experiment {
  id: string;
  project_id: string;
  experiment_name: string;
  experiment_type: string;
  description?: string;
  researcher_id: string;
  created_at: string;
  updated_at: string;
  parameters: ExperimentParameter[];
  status?: string;
  source_type?: string;
  source_doi?: string;
  outcome?: ExperimentOutcome;
  outcomes?: ExperimentOutcome[];
  failures?: FailureClassification[];
}

export interface ExperimentFilter {
  project_id?: string;
  researcher_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface DecisionSupportSummary {
  total_similar_experiments: number;
  successful_experiments: number;
  failed_experiments: number;
  average_yield?: number;
  contradiction_count: number;
}

export interface DecisionSupportConfidence {
  score: number;
  level: 'Low' | 'Medium' | 'High' | string;
  explanation: string;
  key_factors: string[];
}

export interface CounterfactualSuggestion {
  original_config: Record<string, any>;
  suggested_modification: Record<string, any>;
  reasoning: string;
  supporting_experiments: string[];
  historical_evidence_summary: string;
  uncertainty_level: 'low' | 'medium' | 'high' | string;
  confidence_score: number;
}

export interface RecalledExperience {
  memory_id: string;
  content: string;
  metadata: Record<string, any>;
  relevance_score: number;
  hindsight_mode: string;
  timestamp: string;
}

export interface ProvenanceRecord {
  source_type: string;
  source_id: string;
  description?: string;
  timestamp?: string;
  retrieval_method?: string;
  relevance_score?: number;
}

export interface ProposalReviewRequest {
  experiment_name: string;
  description?: string;
  proposed_parameters: Record<string, any>;
  memory_mode?: boolean;
}

export interface ProposalReviewResponse {
  proposal: {
    experiment_name: string;
    description?: string;
    proposed_parameters: Record<string, any>;
  };
  memory_mode: 'MEMORY_ON' | 'MEMORY_OFF';
  similar_experiments_count: number;
  historical_failures_count: number;
  historical_successes_count: number;
  decision_support: DecisionSupportSummary;
  confidence: DecisionSupportConfidence;
  counterfactual_suggestions: CounterfactualSuggestion[];
  hindsight_recalled_experience: RecalledExperience[];
  provenance: ProvenanceRecord[];
  recommendation: string;
  uncertainty_note: string;
}

export interface MemoryRetainRequest {
  content: string;
  metadata?: Record<string, any>;
  hindsight_mode?: string;
  project_id?: string;
  researcher_id?: string;
}

export interface MemoryRetainResponse {
  memory_id: string;
  content: string;
  metadata?: Record<string, any>;
  status: string;
  timestamp: string;
}

export interface MemoryRecallRequest {
  query: string;
  top_k?: number;
}

export interface MemoryRecallResponse {
  query: string;
  memories: RecalledExperience[];
  hindsight_integration: string;
}

export interface MemoryReflectRequest {
  topic?: string;
  project_id?: string;
}

export interface MemoryReflectResponse {
  topic: string;
  summary: string;
  key_insights: string[];
  candidate_directives: string[];
  hindsight_integration: string;
  timestamp: string;
}

export interface DirectiveApproveRequest {
  approved: boolean;
  notes?: string;
}

export interface MentalModelResponse {
  id: string;
  model_name: string;
  description: string;
  confidence: number;
  supporting_experiments_count: number;
  status: string;
  directives: Array<{
    id: string;
    directive_text: string;
    status: string;
  }>;
}

export interface PatternResponse {
  id: string;
  cluster_name: string;
  algorithm: string;
  supporting_experiments_count: number;
  confidence: number;
  supporting_experiment_ids: string[];
}

export interface FeedbackCreate {
  target_entity_type?: 'memory' | 'recommendation' | 'pattern' | 'counterfactual' | string;
  target_entity_id?: string;
  target_type?: string;
  target_id?: string;
  rating?: string;
  comments?: string;
  is_helpful?: boolean;
  relevance_rating?: number;
  comment?: string;
  researcher_id?: string;
}

export interface FeedbackResponse {
  id: string;
  target_entity_type?: string;
  target_entity_id?: string;
  target_type?: string;
  target_id?: string;
  rating?: string;
  is_helpful?: boolean;
  relevance_rating?: number;
  comment?: string;
  comments?: string;
  researcher_id?: string;
  created_at: string;
}

export interface AuditLogResponse {
  id: string;
  timestamp: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  researcher_id?: string;
  source?: string;
  actor?: string;
  details?: string;
  ip_address?: string;
  new_state?: any;
}

export interface ImpactMetricsSummary {
  total_accumulated_experiments: number;
  total_logged_outcomes: number;
  total_failure_records: number;
  total_discovered_patterns: number;
  total_experiential_memories: number;
  total_candidate_directives: number;
  approved_directives: number;
  researcher_feedback_count: number;
}

export interface ImpactMetricsAblationMode {
  retrieved_evidence_signal: string;
  failure_pattern_detection: string;
  recommendation_relevance_score: number;
  average_confidence_score: number;
  repeated_failure_avoidance_rate: string;
}

export interface ImpactMetricsResponse {
  platform: string;
  hindsight_integration: string;
  summary: ImpactMetricsSummary;
  ablation_study: {
    without_memory_mode: ImpactMetricsAblationMode;
    with_resona_memory_mode: ImpactMetricsAblationMode;
    memory_improvement_delta: {
      relevance_gain: string;
      confidence_gain: string;
      failure_reduction: string;
      failure_avoidance_improvement?: string;
    };
  };
}

export interface SystemHealthResponse {
  status: string;
  version: string;
  services: {
    database: string;
    hindsight_memory: string;
    embedding_service: string;
  };
}
export type HealthResponse = SystemHealthResponse;
