import { Router } from "express";
import {
  getMyNotifications,
  getMyUnreadNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController";
import { requireAuth } from "../middleswares/authMiddleware";

const notificationRouter = Router();

// Toutes les routes nécessitent l'authentification
notificationRouter.get("/me", requireAuth, getMyNotifications);
notificationRouter.get("/unread", requireAuth, getMyUnreadNotifications);
notificationRouter.get(
  "/unread/count",
  requireAuth,
  getUnreadNotificationCount,
);
notificationRouter.patch(
  "/:notificationId/read",
  requireAuth,
  markNotificationAsRead,
);
notificationRouter.patch("/read-all", requireAuth, markAllAsRead);
notificationRouter.delete("/:notificationId", requireAuth, deleteNotification);

export default notificationRouter;
