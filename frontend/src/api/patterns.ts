import { apiClient } from './client';
import { PatternResponse } from '../types';

export async function fetchPatterns(): Promise<PatternResponse[]> {
  const response = await apiClient.get<PatternResponse[]>('/api/v1/patterns');
  return response.data;
}

export async function triggerPatternDiscovery(): Promise<{ message: string; patterns_count: number }> {
  const response = await apiClient.post<{ message: string; patterns_count: number }>('/api/v1/patterns');
  return response.data;
}
