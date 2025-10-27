import { apiClient } from './api.service';
import type { User } from '../types/auth.types';

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
  } | null;
  errors?: string;
}

export const userService = {
  /**
   * Search users by email or username
   */
  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response = await apiClient.get<UsersResponse>(
      `/users/search?q=${encodeURIComponent(query)}`
    );

    if (!response.data?.users) {
      throw new Error(response.errors || 'Erreur lors de la recherche d\'utilisateurs');
    }

    return response.data.users;
  },
};
