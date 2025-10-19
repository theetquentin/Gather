import { apiClient } from './api.service';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '../types/collection.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: string | null;
}

export const collectionService = {
  async getAllCollections(): Promise<Collection[]> {
    const response = await apiClient.get<ApiResponse<Collection[]>>('/collections');
    return response.data;
  },

  async getUserCollections(): Promise<Collection[]> {
    const response = await apiClient.get<ApiResponse<{ collections: Collection[] }>>('/collections/me');
    return response.data.collections;
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
