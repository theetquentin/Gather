import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notification.service";
import { shareService } from "../services/share.service";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingMessage } from "../components/LoadingMessage";
import type { Notification } from "../types/notification.types";

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data =
        filter === "unread"
          ? await notificationService.getUnreadNotifications()
          : await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId
            ? { ...n, readAt: new Date().toISOString() }
            : n,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du marquage");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du marquage");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    }
  };

  const handleAcceptShare = async (notificationId: string, shareId: string) => {
    try {
      setError("");
      // Accepter le partage
      await shareService.updateShareStatus(shareId, { status: "accepted" });
      // Supprimer la notification de la liste
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'acceptation",
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "share":
        return "🔗";
      case "review":
        return "⭐";
      case "alert":
        return "🔔";
      default:
        return "📬";
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (isLoading)
    return <LoadingMessage message="Chargement des notifications..." />;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-slate-700 mt-2">
              {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
              {unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-action-color hover:text-action-color-hover font-medium"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === "all"
              ? "bg-action-color text-slate-100"
              : "bg-secondary-color text-slate-900 hover:bg-primary-color"
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === "unread"
              ? "bg-action-color text-slate-100"
              : "bg-secondary-color text-slate-900 hover:bg-primary-color"
          }`}
        >
          Non lues
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-primary-color p-12 rounded-xl text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            {filter === "unread"
              ? "Aucune notification non lue"
              : "Aucune notification"}
          </h2>
          <p className="text-slate-700">
            {filter === "unread"
              ? "Vous êtes à jour !"
              : "Les notifications apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.readAt
                  ? "bg-primary-color border-slate-300"
                  : "bg-secondary-color border-action-color"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-slate-900 ${!notification.readAt ? "font-medium" : ""}`}
                    >
                      {notification.message}
                    </p>
                    {!notification.readAt && (
                      <span className="w-2 h-2 bg-action-color rounded-full mt-2 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                  <div className="flex gap-3 mt-3">
                    {notification.type === "share" &&
                      notification.shareId &&
                      !notification.readAt && (
                        <button
                          onClick={() =>
                            handleAcceptShare(
                              notification._id,
                              notification.shareId as string,
                            )
                          }
                          className="text-sm bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 rounded font-medium"
                        >
                          Accepter l'invitation
                        </button>
                      )}
                    {!notification.readAt && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-sm text-action-color hover:text-action-color-hover font-medium"
                      >
                        Marquer comme lu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
