import { Response } from "express";
import {
  fetchNotificationsByUser,
  fetchUnreadNotificationsByUser,
  markNotificationAsReadById,
  markAllNotificationsAsReadByUser,
  deleteNotificationById,
  getUnreadCount,
} from "../services/notificationService";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";
import { handleServiceError } from "../utils/errorHandler";

const notificationErrorMap: Record<string, number> = {
  "Identifiant de notification invalide": 400,
  "Identifiant utilisateur invalide": 400,
  "Notification non trouvée": 404,
  "Accès refusé à cette notification": 403,
};

export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const notifications = await fetchNotificationsByUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Liste de vos notifications",
      data: { notifications },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, notificationErrorMap);
  }
};

export const getMyUnreadNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const notifications = await fetchUnreadNotificationsByUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Notifications non lues",
      data: { notifications },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, notificationErrorMap);
  }
};

export const getUnreadNotificationCount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const count = await getUnreadCount(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Nombre de notifications non lues",
      data: { count },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, notificationErrorMap);
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { notificationId } = req.params;
    const notification = await markNotificationAsReadById(
      notificationId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Notification marquée comme lue",
      data: { notification },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, notificationErrorMap);
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    await markAllNotificationsAsReadByUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Toutes les notifications ont été marquées comme lues",
      data: null,
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, notificationErrorMap);
  }
};

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { notificationId } = req.params;
    await deleteNotificationById(notificationId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Notification supprimée",
      data: null,
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, notificationErrorMap);
  }
};
