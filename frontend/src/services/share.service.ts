import { apiClient } from './api.service';
import type {
  Share,
  CreateShareInput,
  UpdateShareStatusInput,
  ShareResponse,
  SharesResponse,
} from '../types/share.types';

export const shareService = {
  /**
   * Créé une nouvelle invitation partage
   */
  async createShare(data: CreateShareInput): Promise<Share> {
    const response = await apiClient.post<ShareResponse>('/shares', data);
    if (!response.data?.share) {
      throw new Error(response.errors || 'Erreur lors de la création du partage');
    }
    return response.data.share;
  },

  /**
   * Récupérer tous les partages de l'utilisateur
   */
  async getMyShares(): Promise<Share[]> {
    const response = await apiClient.get<SharesResponse>('/shares/me');
    if (!response.data?.shares) {
      throw new Error(response.errors || 'Erreur lors de la récupération des partages');
    }
    return response.data.shares;
  },

  /**
   * Récupérer tous les partages pour une collection donnée
   */
  async getCollectionShares(collectionId: string): Promise<Share[]> {
    const response = await apiClient.get<SharesResponse>(
      `/shares/collection/${collectionId}`
    );
    if (!response.data?.shares) {
      throw new Error(response.errors || 'Erreur lors de la récupération des partages');
    }
    return response.data.shares;
  },

  /**
   * Mettre à jour le status du partage
   */
  async updateShareStatus(
    shareId: string | Share,
    data: UpdateShareStatusInput
  ): Promise<Share> {
    const id = typeof shareId === 'string' ? shareId : shareId._id;
    const response = await apiClient.patch<ShareResponse>(
      `/shares/${id}/status`,
      data
    );
    if (!response.data?.share) {
      throw new Error(response.errors || 'Erreur lors de la mise à jour du statut');
    }
    return response.data.share;
  },

  /**
   * Supprimer un partage
   */
  async deleteShare(shareId: string | Share): Promise<void> {
    const id = typeof shareId === 'string' ? shareId : shareId._id;
    await apiClient.delete(`/shares/${id}`);
  },
};
