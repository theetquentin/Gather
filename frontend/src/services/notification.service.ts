import { apiClient } from './api.service';
import type {
  Notification,
  NotificationResponse,
  NotificationsResponse,
  UnreadCountResponse,
} from '../types/notification.types';

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getMyNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<NotificationsResponse>('/notifications/me');
    if (!response.data?.notifications) {
      throw new Error(
        response.errors || 'Erreur lors de la récupération des notifications'
      );
    }
    return response.data.notifications;
  },

  /**
   * Get only unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<NotificationsResponse>('/notifications/unread');
    if (!response.data?.notifications) {
      throw new Error(
        response.errors || 'Erreur lors de la récupération des notifications non lues'
      );
    }
    return response.data.notifications;
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>(
      '/notifications/unread/count'
    );
    if (response.data?.count === undefined) {
      throw new Error(
        response.errors || 'Erreur lors de la récupération du nombre de notifications'
      );
    }
    return response.data.count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.patch<NotificationResponse>(
      `/notifications/${notificationId}/read`,
      {}
    );
    if (!response.data?.notification) {
      throw new Error(
        response.errors || 'Erreur lors du marquage de la notification'
      );
    }
    return response.data.notification;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all', {});
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};
