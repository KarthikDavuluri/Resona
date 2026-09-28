import { apiClient } from './client';
import { Experiment, ExperimentCreate, OutcomeCreate, OutcomeResponse, FailureCreate, FailureResponse } from '../types';

export interface GetExperimentsParams {
  skip?: number;
  limit?: number;
  project_id?: string;
  status?: string;
  search?: string;
}

export async function fetchExperiments(params?: GetExperimentsParams): Promise<Experiment[]> {
  const response = await apiClient.get<Experiment[]>('/api/v1/experiments', { params });
  return response.data;
}

export async function fetchExperimentById(id: string): Promise<Experiment> {
  const response = await apiClient.get<Experiment>(`/api/v1/experiments/${id}`);
  return response.data;
}

export async function createExperiment(data: ExperimentCreate): Promise<Experiment> {
  const response = await apiClient.post<Experiment>('/api/v1/experiments', data);
  return response.data;
}

export async function updateExperiment(id: string, data: Partial<ExperimentCreate>): Promise<Experiment> {
  const response = await apiClient.put<Experiment>(`/api/v1/experiments/${id}`, data);
  return response.data;
}

export async function logExperimentOutcome(id: string, data: OutcomeCreate): Promise<OutcomeResponse> {
  const response = await apiClient.post<OutcomeResponse>(`/api/v1/experiments/${id}/outcome`, data);
  return response.data;
}

export async function logExperimentFailure(id: string, data: FailureCreate): Promise<FailureResponse> {
  const response = await apiClient.post<FailureResponse>(`/api/v1/experiments/${id}/failure`, data);
  return response.data;
}
