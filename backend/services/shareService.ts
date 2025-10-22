import { Types } from "mongoose";
import { IShare } from "../interfaces/interface.ishare";
import {
  createShare,
  getShareById,
  getSharesByCollectionId,
  getSharesByGuestId,
  updateShareStatus,
  updateShare,
  deleteShare,
} from "../repositories/shareRepository";
import { getCollectionById } from "../repositories/collectionRepository";
import { getUserById } from "../repositories/userRepository";
import {
  createNotification,
  markNotificationAsRead,
  deleteNotificationsByShareId,
  getNotificationsByShareId,
} from "../repositories/notificationRepository";

// Helper pour extraire l'ID depuis un champ potentiellement populé
const getIdString = (
  field: Types.ObjectId | { _id: Types.ObjectId },
): string => {
  if (field && typeof field === "object" && "_id" in field) {
    return field._id.toString();
  }
  return (field as Types.ObjectId).toString();
};

export const createNewShare = async (data: IShare) => {
  const { collectionId, guestId, authorId } = data;

  // Vérifier que la collection existe
  const collection = await getCollectionById(collectionId.toString());
  if (!collection) throw new Error("Collection non trouvée");

  // Vérifier que l'utilisateur invité existe
  const guest = await getUserById(guestId.toString());
  if (!guest) throw new Error("Utilisateur invité non trouvé");

  // Vérifier que l'auteur existe
  const author = await getUserById(authorId.toString());
  if (!author) throw new Error("Auteur non trouvé");

  // Vérifier que l'auteur est le propriétaire de la collection
  if (collection.userId.toString() !== authorId.toString()) {
    throw new Error("Seul le propriétaire peut partager cette collection");
  }

  // Vérifier que l'auteur ne se partage pas à lui-même
  if (guestId.toString() === authorId.toString()) {
    throw new Error(
      "Vous ne pouvez pas vous partager une collection à vous-même",
    );
  }

  // Créer le partage
  const newShare = await createShare(data);

  // Créer automatiquement une notification pour l'invité
  await createNotification({
    userId: guestId,
    senderId: authorId,
    collectionId: collection._id,
    shareId: newShare._id,
    type: "share",
    message: `${author.username} vous a invité à voir la collection "${collection.name}"`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return newShare;
};

export const fetchShareById = async (shareId: string) => {
  if (!Types.ObjectId.isValid(shareId)) {
    throw new Error("Identifiant de partage invalide");
  }

  const share = await getShareById(shareId);
  if (!share) throw new Error("Partage non trouvé");

  return share;
};

export const fetchSharesByCollection = async (collectionId: string) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  // Vérifier que la collection existe
  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  return await getSharesByCollectionId(collectionId);
};

export const fetchSharesByGuest = async (guestId: string) => {
  if (!Types.ObjectId.isValid(guestId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  return await getSharesByGuestId(guestId);
};

export const updateShareStatusById = async (
  shareId: string,
  status: "pending" | "refused" | "accepted",
  userId: string,
) => {
  if (!Types.ObjectId.isValid(shareId)) {
    throw new Error("Identifiant de partage invalide");
  }

  const share = await getShareById(shareId);
  if (!share) throw new Error("Partage non trouvé");

  // Seul l'invité peut accepter ou refuser
  // guestId peut être populé donc on utilise le helper
  const guestIdString = getIdString(share.guestId);

  if (guestIdString !== userId) {
    throw new Error("Seul l'invité peut modifier le statut du partage");
  }

  // Mettre à jour le statut du partage
  const updatedShare = await updateShareStatus(shareId, status);

  // Marquer automatiquement la notification associée comme lue
  const notifications = await getNotificationsByShareId(shareId, userId);
  for (const notif of notifications) {
    if (!notif.readAt) {
      await markNotificationAsRead(notif._id.toString());
    }
  }

  return updatedShare;
};

export const updateShareById = async (
  shareId: string,
  updates: Partial<IShare>,
  userId: string,
) => {
  if (!Types.ObjectId.isValid(shareId)) {
    throw new Error("Identifiant de partage invalide");
  }

  const share = await getShareById(shareId);
  if (!share) throw new Error("Partage non trouvé");

  // Seul l'auteur peut modifier les droits
  // authorId peut être populé donc on utilise le helper
  const authorIdString = getIdString(share.authorId);

  if (authorIdString !== userId) {
    throw new Error("Seul l'auteur peut modifier ce partage");
  }

  // On ne peut modifier que les droits
  const safeUpdates: Partial<IShare> = {};
  if (updates.rights) safeUpdates.rights = updates.rights;

  return await updateShare(shareId, safeUpdates);
};

export const deleteShareById = async (shareId: string, userId: string) => {
  if (!Types.ObjectId.isValid(shareId)) {
    throw new Error("Identifiant de partage invalide");
  }

  const share = await getShareById(shareId);
  if (!share) throw new Error("Partage non trouvé");

  // L'auteur ou l'invité peuvent supprimer le partage
  // authorId et guestId peuvent être populés donc on utilise le helper
  const authorIdString = getIdString(share.authorId);
  const guestIdString = getIdString(share.guestId);

  const isAuthor = authorIdString === userId;
  const isGuest = guestIdString === userId;

  if (!isAuthor && !isGuest) {
    throw new Error("Vous n'êtes pas autorisé à supprimer ce partage");
  }

  // Supprimer les notifications associées à ce partage
  await deleteNotificationsByShareId(shareId);

  return await deleteShare(shareId);
};
