import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import { notificationService } from "../services/notification.service";
import { shareService } from "../services/share.service";
import type { Notification } from "../types/notification.types";

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    loadUnreadCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Charger les notifications quand on ouvre le dropdown
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Erreur lors du chargement du compteur:", err);
    }
  };

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getUnreadNotifications();
      // Limiter à 5 notifications les plus récentes
      setNotifications(data.slice(0, 5));
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (
    notificationId: string,
    event?: React.MouseEvent,
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  };

  const handleAcceptShare = async (
    notificationId: string,
    shareId: string,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      // Accepter le partage
      await shareService.updateShareStatus(shareId, { status: "accepted" });

      // Marquer la notification comme lue (le backend le fait automatiquement mais on le fait aussi côté client)
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur lors de l'acceptation:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-900 hover:text-action-color transition-colors rounded-full hover:bg-secondary-color"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
      >
        <IoNotificationsOutline size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-primary-color border border-slate-300 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-slate-300">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-700 mt-1">
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
                {unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-700">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-700">
                Aucune nouvelle notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-3 border-b border-slate-200 hover:bg-secondary-color transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-action-color rounded-full mt-2 flex-shrink-0"></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-slate-600">
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.type === "share" &&
                          notification.shareId && (
                            <button
                              onClick={(e) => {
                                const shareId =
                                  typeof notification.shareId === "object" &&
                                  notification.shareId !== null &&
                                  "_id" in notification.shareId
                                    ? (notification.shareId as { _id: string })
                                        ._id
                                    : (notification.shareId as string);

                                handleAcceptShare(notification._id, shareId, e);
                              }}
                              className="text-xs bg-action-color hover:bg-action-color-hover text-slate-100 px-2 py-1 rounded font-medium"
                            >
                              Accepter
                            </button>
                          )}

                        <button
                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                          className="text-xs text-action-color hover:text-action-color-hover font-medium ml-auto"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-300">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-action-color hover:text-action-color-hover font-medium"
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
