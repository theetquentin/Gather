import { Types } from "mongoose";
import { ICollection } from "../interfaces/interface.icollection";
import {
  createCollection,
  countCollectionByNameByUser,
  getCollectionById,
  getAllCollections,
  getCollectionsByUserId,
  getPublicCollections,
  updateCollection,
  deleteCollection,
  addWorksToCollectionByIds,
} from "../repositories/collectionRepository";
import { getUserById } from "../repositories/userRepository";
import {
  countWorksByIds,
  getWorkTypesByIds,
} from "../repositories/workRepository";
import {
  getAcceptedShareByCollectionAndGuest,
  getAcceptedSharesByGuestId,
  getSharesByCollectionId,
  deleteSharesByCollectionId,
} from "../repositories/shareRepository";
import { deleteNotificationsByShareId } from "../repositories/notificationRepository";

export const createNewCollection = async (data: ICollection) => {
  const { name, works, userId } = data;

  const countCollection = await countCollectionByNameByUser(name, userId);
  if (countCollection > 0) {
    throw new Error("Vous avez déjà nommé une de vos collections ainsi");
  }

  const user = await getUserById(userId.toString());
  if (!user) throw new Error("Utilisateur non trouvé");

  const uniqueWorks = works
    ? Array.from(new Set(works.map((w) => w.toString()))).map(
        (id) => new Types.ObjectId(id),
      )
    : undefined;

  if (uniqueWorks && uniqueWorks.length > 0) {
    const count = await countWorksByIds(uniqueWorks);
    if (count !== uniqueWorks.length) {
      throw new Error("Certaines œuvres n'existent pas");
    }

    const types = await getWorkTypesByIds(uniqueWorks);
    const mismatchedIds = types
      .filter((t) => t.type !== data.type)
      .map((t) => t._id.toString());

    if (mismatchedIds.length > 0) {
      throw new Error(
        `Les oeuvres ne sont pas du même type que la collection:${mismatchedIds.join(",")}`,
      );
    }
  }

  return await createCollection({ ...data, works: uniqueWorks ?? undefined });
};

export const addWorksToCollection = async (
  collectionId: string,
  workIds: string[],
  userId: string,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = collection.userId.toString() === userId;

  // Si pas propriétaire, vérifier les droits de partage
  let hasEditRights = false;
  if (!isOwner) {
    const share = await getAcceptedShareByCollectionAndGuest(
      new Types.ObjectId(collectionId),
      new Types.ObjectId(userId),
    );
    hasEditRights = share?.rights === "edit";
  }

  // Refuser l'accès si ni propriétaire ni droits d'édition
  if (!isOwner && !hasEditRights) {
    throw new Error("Accès refusé à cette collection");
  }

  const validIds: Types.ObjectId[] = [];
  const invalidIds: string[] = [];

  for (const id of workIds) {
    if (Types.ObjectId.isValid(id)) {
      validIds.push(new Types.ObjectId(id));
    } else {
      invalidIds.push(id);
    }
  }

  const types = await getWorkTypesByIds(validIds);
  const foundIdsSet = new Set(types.map((t) => t._id.toString()));

  const nonexistentIds = validIds
    .map((oid) => oid.toString())
    .filter((id) => !foundIdsSet.has(id));

  const mismatchedIds = types
    .filter((t) => t.type !== collection.type)
    .map((t) => t._id.toString());

  if (mismatchedIds.length > 0) {
    throw new Error(
      `Les oeuvres ne sont pas du même type que la collection:${mismatchedIds.join(",")}`,
    );
  }

  const eligibleIds = validIds.filter(
    (oid) =>
      foundIdsSet.has(oid.toString()) &&
      !mismatchedIds.includes(oid.toString()),
  );

  if (eligibleIds.length > 0) {
    const updated = await addWorksToCollectionByIds(collectionId, eligibleIds);
    if (!updated) throw new Error("Échec de la mise à jour de la collection");

    return {
      updatedCollection: updated,
      invalidIds,
      nonexistentIds,
      mismatchedIds,
      addedCount: eligibleIds.length,
    };
  }

  return {
    updatedCollection: collection,
    invalidIds,
    nonexistentIds,
    mismatchedIds,
    addedCount: 0,
  };
};

export const fetchCollections = async (publicOnly?: boolean) => {
  if (publicOnly) {
    return await getPublicCollections();
  }
  return await getAllCollections();
};

const fetchSharedCollectionsByUser = async (userId: string) => {
  const shares = await getAcceptedSharesByGuestId(userId);

  // Transformer les shares en collections enrichies avec les métadonnées de partage
  return shares
    .filter((share) => share.collectionId) // Filtrer les shares où la collection existe encore
    .map((share) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collection = share.collectionId as any; // Collection populée par Mongoose (déjà en plain object via .lean())
      return {
        ...collection, // Pas besoin de .toObject() car .lean() retourne déjà un plain object
        owned: false, // Ces collections ne sont pas possédées par l'utilisateur
        rights: share.rights,
        authorId: share.authorId,
      };
    });
};

export const fetchCollectionsByUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  // Récupérer les collections personnelles de l'utilisateur
  const ownedCollections = await getCollectionsByUserId(userId);

  // Récupérer les collections partagées avec l'utilisateur (status: accepted)
  const sharedCollections = await fetchSharedCollectionsByUser(userId);

  // Ajouter le champ "owned" aux collections personnelles
  const ownedCollectionsWithFlag = ownedCollections.map((collection) => ({
    ...collection.toObject(),
    owned: true,
  }));

  // Combiner les deux listes
  return [...ownedCollectionsWithFlag, ...sharedCollections];
};

export const fetchCollectionById = async (
  collectionId: string,
  userId?: string,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  // Si la collection est publique, tout le monde peut la voir
  if (collection.visibility === "public") {
    // Déterminer si l'utilisateur est le propriétaire
    const owned = userId ? collection.userId.toString() === userId : false;
    return {
      ...collection.toObject(),
      owned,
    };
  }

  // Pour les collections privées ou partagées, authentification obligatoire
  if (!userId) {
    throw new Error("Authentification requise pour accéder à cette collection");
  }

  // Vérifier si c'est le propriétaire
  const isOwner = collection.userId.toString() === userId;
  if (isOwner) {
    return {
      ...collection.toObject(),
      owned: true,
    };
  }

  // Vérifier si l'utilisateur a un partage accepté pour cette collection
  const share = await getAcceptedShareByCollectionAndGuest(
    new Types.ObjectId(collectionId),
    new Types.ObjectId(userId),
  );

  if (share) {
    return {
      ...collection.toObject(),
      owned: false,
      rights: share.rights,
      authorId: share.authorId,
    };
  }

  // Aucun accès trouvé
  throw new Error("Accès refusé à cette collection");
};

export const updateCollectionById = async (
  collectionId: string,
  userId: string,
  updates: Partial<ICollection>,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = collection.userId.toString() === userId;

  // Si pas propriétaire, vérifier les droits de partage
  let hasEditRights = false;
  if (!isOwner) {
    const share = await getAcceptedShareByCollectionAndGuest(
      new Types.ObjectId(collectionId),
      new Types.ObjectId(userId),
    );
    hasEditRights = share?.rights === "edit";
  }

  // Refuser l'accès si ni propriétaire ni droits d'édition
  if (!isOwner && !hasEditRights) {
    throw new Error("Accès refusé à cette collection");
  }

  // Seul le propriétaire peut modifier le nom, le type et la visibilité
  if (!isOwner && (updates.name || updates.type || updates.visibility)) {
    throw new Error(
      "Seul le propriétaire peut modifier les informations de la collection",
    );
  }

  if (updates.name && updates.name !== collection.name) {
    const count = await countCollectionByNameByUser(
      updates.name,
      new Types.ObjectId(userId),
    );
    if (count > 0) {
      throw new Error("Vous avez déjà une collection avec ce nom");
    }
  }

  // Si on change la visibilité de "shared" vers autre chose, supprimer tous les partages
  if (
    updates.visibility &&
    collection.visibility === "shared" &&
    updates.visibility !== "shared"
  ) {
    // Récupérer tous les partages de cette collection
    const shares = await getSharesByCollectionId(collectionId);

    // Supprimer les notifications associées à chaque partage
    for (const share of shares) {
      await deleteNotificationsByShareId(share._id.toString());
    }

    // Supprimer tous les partages de la collection
    await deleteSharesByCollectionId(collectionId);
  }

  const safeUpdates: Record<string, string | Types.ObjectId[]> = {};
  if (updates.name) safeUpdates.name = updates.name;
  if (updates.type) safeUpdates.type = updates.type;
  if (updates.visibility) safeUpdates.visibility = updates.visibility;
  if (updates.works !== undefined) safeUpdates.works = updates.works;

  const updated = await updateCollection(collectionId, safeUpdates);
  if (!updated) throw new Error("Échec de la mise à jour de la collection");

  return updated;
};

export const deleteCollectionById = async (
  collectionId: string,
  userId: string,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  if (collection.userId.toString() !== userId) {
    throw new Error("Accès refusé à cette collection");
  }

  const deleted = await deleteCollection(collectionId);
  if (!deleted) throw new Error("Échec de la suppression de la collection");

  return deleted;
};
