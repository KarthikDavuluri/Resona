import { apiClient } from './client';
import {
  MemoryRetainRequest, MemoryRetainResponse,
  MemoryRecallRequest, MemoryRecallResponse,
  MemoryReflectRequest, MemoryReflectResponse,
  MentalModelResponse, DirectiveApproveRequest
} from '../types';

export async function retainMemory(data: MemoryRetainRequest): Promise<MemoryRetainResponse> {
  const response = await apiClient.post<MemoryRetainResponse>('/api/v1/memory/retain', data);
  return response.data;
}

export async function recallMemory(data: MemoryRecallRequest): Promise<MemoryRecallResponse> {
  const response = await apiClient.post<MemoryRecallResponse>('/api/v1/memory/recall', data);
  return response.data;
}

export async function reflectMemory(data: MemoryReflectRequest): Promise<MemoryReflectResponse> {
  const response = await apiClient.post<MemoryReflectResponse>('/api/v1/memory/reflect', data);
  return response.data;
}

export async function fetchMentalModels(): Promise<MentalModelResponse[]> {
  const response = await apiClient.get<MentalModelResponse[]>('/api/v1/memory/models');
  return response.data;
}

export async function approveDirective(id: string, data: DirectiveApproveRequest): Promise<any> {
  const response = await apiClient.post<any>(`/api/v1/memory/directives/${id}/approve`, data);
  return response.data;
}
