import Notification from "../models/Notification";
import { INotification } from "../interfaces/interface.inotification";

export const createNotification = async (data: INotification) => {
  return await Notification.create({ ...data });
};

export const getNotificationById = async (notificationId: string) => {
  return await Notification.findById(notificationId)
    .populate("senderId", "username email")
    .populate("collectionId", "name type visibility")
    .populate("workId", "title type")
    .populate("shareId");
};

export const getNotificationsByUserId = async (userId: string) => {
  return await Notification.find({ userId })
    .populate("senderId", "username email")
    .populate("collectionId", "name type visibility")
    .populate("workId", "title type")
    .populate("shareId")
    .sort({ createdAt: -1 }); // Plus récentes en premier
};

export const getUnreadNotificationsByUserId = async (userId: string) => {
  return await Notification.find({ userId, readAt: null })
    .populate("senderId", "username email")
    .populate("collectionId", "name type visibility")
    .populate("workId", "title type")
    .populate("shareId")
    .sort({ createdAt: -1 });
};

export const markNotificationAsRead = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { readAt: new Date() },
    { new: true },
  );
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return await Notification.updateMany(
    { userId, readAt: null },
    { readAt: new Date() },
  );
};

export const deleteNotification = async (notificationId: string) => {
  return await Notification.findByIdAndDelete(notificationId);
};

export const deleteNotificationsByShareId = async (shareId: string) => {
  return await Notification.deleteMany({ shareId });
};

export const countUnreadNotifications = async (userId: string) => {
  return await Notification.countDocuments({ userId, readAt: null });
};
