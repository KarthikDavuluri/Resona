import { apiClient } from './client';
import { FeedbackCreate, FeedbackResponse } from '../types';

export async function submitFeedback(data: FeedbackCreate): Promise<FeedbackResponse> {
  // Map frontend fields to FastAPI FeedbackCreate schema expectations
  const ratingStr = data.rating
    ? data.rating
    : data.is_helpful === false
    ? 'not_useful'
    : 'useful';

  const payload = {
    researcher_id: data.researcher_id || 'res_dr_elena',
    target_type: data.target_type || data.target_entity_type || 'recommendation',
    target_id: data.target_id || data.target_entity_id || 'mem_8f192a',
    rating: ratingStr,
    comments: data.comments || data.comment || undefined,
  };

  const response = await apiClient.post<FeedbackResponse>('/api/v1/feedback', payload);
  return response.data;
}
