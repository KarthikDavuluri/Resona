import { apiClient } from './client';
import { ProposalReviewRequest, ProposalReviewResponse } from '../types';

export async function reviewProposal(data: ProposalReviewRequest): Promise<ProposalReviewResponse> {
  const response = await apiClient.post<ProposalReviewResponse>('/api/v1/proposals/review', data);
  return response.data;
}

export async function executeQueryEngine(payload: { query: string; project_id?: string; memory_mode?: boolean }): Promise<ProposalReviewResponse> {
  const response = await apiClient.post<ProposalReviewResponse>('/api/v1/query', payload);
  return response.data;
}
