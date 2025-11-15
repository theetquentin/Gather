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
}

interface UploadAvatarResponse {
  success: boolean;
  errors: string | null;
  data: {
    avatarUrl: string;
    publicId: string;
  } | null;
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

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.upload<UploadAvatarResponse>(
      '/upload/avatar',
      formData
    );

    if (!response.data?.avatarUrl) {
      throw new Error(response.errors || 'Erreur lors de l\'upload de l\'avatar');
    }

    return response.data.avatarUrl;
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<void> {
    const response = await apiClient.delete<{ success: boolean; errors: string | null }>(
      '/upload/avatar'
    );

    if (!response.success) {
      throw new Error(response.errors || 'Erreur lors de la suppression de l\'avatar');
    }
  },
};
