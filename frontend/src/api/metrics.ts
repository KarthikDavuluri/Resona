import { apiClient } from './client';
import { ImpactMetricsResponse } from '../types';

export async function fetchImpactMetrics(): Promise<ImpactMetricsResponse> {
  const response = await apiClient.get<ImpactMetricsResponse>('/api/v1/impact-metrics');
  return response.data;
}
