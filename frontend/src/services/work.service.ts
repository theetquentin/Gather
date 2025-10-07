import { apiClient } from './api.service';
import type { WorksResponse } from '../types/work.types';

export const workService = {
  async getWorks(limit?: number): Promise<WorksResponse> {
    const endpoint = limit ? `/works?limit=${limit}` : '/works';
    return apiClient.get<WorksResponse>(endpoint);
  },
};

