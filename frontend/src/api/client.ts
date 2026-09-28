import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  details?: any;
}

export function parseApiError(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error)) {
    const serverMsg = error.response?.data?.detail || error.response?.data?.message || error.message;
    return {
      message: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg),
      statusCode: error.response?.status,
      details: error.response?.data,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unexpected system error occurred.' };
}
