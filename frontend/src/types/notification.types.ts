import type { User } from './auth.types';
import type { Share } from './share.types';

export type NotificationType = 'review' | 'share' | 'alert';

export interface Notification {
  _id: string;
  userId: string | User;
  senderId?: string | User;
  collectionId?: string;
  workId?: string;
  shareId?: string | Share;
  type: NotificationType;
  message: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: Notification;
  } | null;
  errors?: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
  } | null;
  errors?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  } | null;
  errors?: string;
}
