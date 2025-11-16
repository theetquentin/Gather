import { apiClient } from './api.service';
import type { WorksResponse, Work } from '../types/work.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: string | null;
}

export const workService = {
  async getWorks(params?: {
    limit?: number;
    type?: string;
    search?: string;
    genres?: string[];
    year?: string;
  }): Promise<WorksResponse> {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.genres && params.genres.length > 0) {
      params.genres.forEach(genre => {
        queryParams.append('genre', genre);
      });
    }
    if (params?.year) {
      queryParams.append('year', params.year);
    }

    const endpoint = queryParams.toString() ? `/works?${queryParams.toString()}` : '/works';
    return apiClient.get<WorksResponse>(endpoint);
  },

  async getWorkById(id: string): Promise<ApiResponse<Work>> {
    return apiClient.get<ApiResponse<Work>>(`/works/${id}`);
  },
};

