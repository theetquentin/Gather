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

interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  } | null;
  errors?: string;
}

interface UpdateProfileData {
  currentPassword: string;
  username?: string;
  email?: string;
  newPassword?: string;
  profilePicture?: string;
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

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    const response = await apiClient.patch<UserResponse>(
      `/users/${userId}`,
      data
    );

    if (!response.data?.user) {
      throw new Error(response.errors || 'Erreur lors de la mise à jour du profil');
    }

    return response.data.user;
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: "admin" | "user" | "moderator"): Promise<User> {
    const response = await apiClient.patch<UserResponse>(
      `/users/${userId}/role`,
      { role }
    );

    if (!response.data?.user) {
      throw new Error(response.errors || 'Erreur lors de la mise à jour du rôle');
    }

    return response.data.user;
  },
};
