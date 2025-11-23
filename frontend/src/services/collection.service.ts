import { apiClient } from './api.service';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '../types/collection.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: string | null;
}

export interface PaginatedCollectionsResponse {
  collections: Collection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetUserCollectionsParams {
  limit?: number;
  page?: number;
  type?: string;
  search?: string;
  visibility?: "owned" | "private" | "public" | "shared" | "shared-with-me";
}

export const collectionService = {
  async getAllCollections(params?: {
    publicOnly?: boolean;
    limit?: number;
    page?: number;
    type?: string;
    search?: string;
  }): Promise<PaginatedCollectionsResponse> {
    const queryParams = new URLSearchParams();

    queryParams.append('publicOnly', params?.publicOnly !== false ? 'true' : 'false');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get<ApiResponse<PaginatedCollectionsResponse>>(
      `/collections?${queryParams.toString()}`
    );
    return response.data;
  },

  async getUserCollections(params?: GetUserCollectionsParams): Promise<PaginatedCollectionsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.visibility) queryParams.append('visibility', params.visibility);

    const url = `/collections/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<PaginatedCollectionsResponse>>(url);
    return response.data;
  },

  async getCollectionById(id: string): Promise<Collection> {
    const response = await apiClient.get<ApiResponse<{ collection: Collection }>>(`/collections/${id}`);
    return response.data.collection;
  },

  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const response = await apiClient.post<ApiResponse<Collection>>('/collections', data);
    return response.data;
  },

  async updateCollection(id: string, data: UpdateCollectionInput): Promise<Collection> {
    const response = await apiClient.patch<ApiResponse<{ collection: Collection }>>(`/collections/${id}`, data);
    return response.data.collection;
  },

  async deleteCollection(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/collections/${id}`);
  },

  async addWorksToCollection(collectionId: string, workIds: string[]): Promise<Collection> {
    const response = await apiClient.post<ApiResponse<Collection>>(`/collections/${collectionId}/works`, { workIds });
    return response.data;
  },
};
