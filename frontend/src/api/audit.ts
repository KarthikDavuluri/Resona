import { apiClient } from './client';
import { AuditLogResponse } from '../types';

export async function fetchAuditLogs(limit: number = 50): Promise<AuditLogResponse[]> {
  const response = await apiClient.get<AuditLogResponse[]>('/api/v1/audit', { params: { limit } });
  return response.data;
}
