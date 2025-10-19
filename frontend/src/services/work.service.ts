import { apiClient } from './api.service';
import type { WorksResponse } from '../types/work.types';

export const workService = {
  async getWorks(params?: { limit?: number; type?: string; search?: string }): Promise<WorksResponse> {
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

    const endpoint = queryParams.toString() ? `/works?${queryParams.toString()}` : '/works';
    return apiClient.get<WorksResponse>(endpoint);
  },
};

