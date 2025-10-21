import { Types } from "mongoose";
import { INotification } from "../interfaces/interface.inotification";
import {
  createNotification,
  getNotificationById,
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  countUnreadNotifications,
} from "../repositories/notificationRepository";

export const createNewNotification = async (data: INotification) => {
  return await createNotification(data);
};

export const fetchNotificationById = async (notificationId: string) => {
  if (!Types.ObjectId.isValid(notificationId)) {
    throw new Error("Identifiant de notification invalide");
  }

  const notification = await getNotificationById(notificationId);
  if (!notification) throw new Error("Notification non trouvée");

  return notification;
};

export const fetchNotificationsByUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  return await getNotificationsByUserId(userId);
};

export const fetchUnreadNotificationsByUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  return await getUnreadNotificationsByUserId(userId);
};

export const markNotificationAsReadById = async (
  notificationId: string,
  userId: string,
) => {
  if (!Types.ObjectId.isValid(notificationId)) {
    throw new Error("Identifiant de notification invalide");
  }

  const notification = await getNotificationById(notificationId);
  if (!notification) throw new Error("Notification non trouvée");

  // Vérifier que la notification appartient bien à l'utilisateur
  if (notification.userId.toString() !== userId) {
    throw new Error("Accès refusé à cette notification");
  }

  return await markNotificationAsRead(notificationId);
};

export const markAllNotificationsAsReadByUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  return await markAllNotificationsAsRead(userId);
};

export const deleteNotificationById = async (
  notificationId: string,
  userId: string,
) => {
  if (!Types.ObjectId.isValid(notificationId)) {
    throw new Error("Identifiant de notification invalide");
  }

  const notification = await getNotificationById(notificationId);
  if (!notification) throw new Error("Notification non trouvée");

  // Vérifier que la notification appartient bien à l'utilisateur
  if (notification.userId.toString() !== userId) {
    throw new Error("Accès refusé à cette notification");
  }

  return await deleteNotification(notificationId);
};

export const getUnreadCount = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  return await countUnreadNotifications(userId);
};
