import { apiClient } from './client';
import { HealthResponse } from '../types';

export async function fetchHealthStatus(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
}
