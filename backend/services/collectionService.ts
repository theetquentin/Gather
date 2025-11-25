import { Types } from "mongoose";
import { ICollection } from "../interfaces/interface.icollection";
import {
  createCollection,
  countCollectionByNameByUser,
  getCollectionById,
  countWorksAlreadyInCollection,
  getAllCollections,
  getPublicCollections,
  updateCollection,
  deleteCollection,
  addWorksToCollectionByIds,
  getCollectionsByUserIdWithFilters,
  getCollectionsByIds,
} from "../repositories/collectionRepository";
import { getUserById } from "../repositories/userRepository";
import {
  validateWorksExist,
  validateWorksType,
  validateAndCategorizeWorks,
} from "./workService";
import {
  getAcceptedShareByCollectionAndGuest,
  getAcceptedSharesByGuestId,
  getSharesByCollectionId,
  deleteSharesByCollectionId,
} from "../repositories/shareRepository";
import { deleteNotificationsByShareId } from "../repositories/notificationRepository";

const DEFAULT_COLLECTION_LIMIT = 20;
const MAX_COLLECTION_LIMIT = 100;

/**
 * Fonction réutilisable pour vérifier les droits d'accès d'un utilisateur sur une collection
 * @param collectionId - L'ID de la collection
 * @param userId - L'ID de l'utilisateur
 * @returns Un objet contenant les informations sur les droits d'accès et la collection
 */
const checkCollectionAccessRights = async (
  collectionId: string,
  userId: string,
  isStaff: boolean = false,
) => {
  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  const isOwner = collection.authorId.toString() === userId;

  // Si propriétaire, pas besoin de vérifier les partages
  if (isOwner) {
    return {
      collection,
      isOwner: true,
      isStaff: false,
      rights: "edit",
    };
  }

  // Si staff, accès complet (comme un propriétaire mais marqué comme staff)
  if (isStaff) {
    return {
      collection,
      isOwner: false,
      isStaff: true,
      rights: "edit",
    };
  }

  // Vérifier les droits de partage
  const share = await getAcceptedShareByCollectionAndGuest(
    new Types.ObjectId(collectionId),
    new Types.ObjectId(userId),
  );

  let rights: "read" | "edit" | "none" = "none";
  if (isOwner || isStaff) rights = "edit";
  else if (share) rights = share.rights as "read" | "edit";

  return {
    collection,
    isOwner,
    isStaff,
    rights,
  };
};

export const createNewCollection = async (data: ICollection) => {
  const { name, works, authorId } = data;

  const countCollection = await countCollectionByNameByUser(name, authorId);
  if (countCollection > 0) {
    throw new Error("Vous avez déjà nommé une de vos collections ainsi");
  }

  const user = await getUserById(authorId.toString());
  if (!user) throw new Error("Utilisateur non trouvé");

  const uniqueWorks = works
    ? Array.from(new Set(works.map((w) => w.toString()))).map(
        (id) => new Types.ObjectId(id),
      )
    : undefined;

  if (uniqueWorks && uniqueWorks.length > 0) {
    // Valider que toutes les œuvres existent
    await validateWorksExist(uniqueWorks);

    // Valider que les œuvres correspondent au type de la collection
    const mismatchedIds = await validateWorksType(uniqueWorks, data.type);

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

  // Vérifier les droits d'accès avec la fonction réutilisable
  const { collection, rights } = await checkCollectionAccessRights(
    collectionId,
    userId,
    false, // isStaff non géré pour l'ajout d'œuvres pour le moment
  );

  if (rights !== "edit") {
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

  // Valider et catégoriser les œuvres
  const { existingIds, nonexistentIds, mismatchedIds } =
    await validateAndCategorizeWorks(validIds, collection.type);

  if (mismatchedIds.length > 0) {
    throw new Error(
      `Les oeuvres ne sont pas du même type que la collection:${mismatchedIds.join(",")}`,
    );
  }

  // Vérifier si des œuvres sont déjà présentes dans la collection
  const alreadyPresentCount = await countWorksAlreadyInCollection(
    collectionId,
    validIds,
  );

  if (alreadyPresentCount > 0) {
    throw new Error(
      validIds.length === 1
        ? "Cette œuvre est déjà présente dans cette collection"
        : "Certaines œuvres sont déjà présentes dans cette collection",
    );
  }

  const eligibleIds = validIds.filter(
    (oid) =>
      existingIds.has(oid.toString()) &&
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

export const fetchCollections = async (
  publicOnly?: boolean,
  limit: number = DEFAULT_COLLECTION_LIMIT,
  page: number = 1,
  type?: string,
  search?: string,
  isStaff: boolean = false,
  userId?: string,
) => {
  // Vérification des droits si on veut voir les collections non publiques
  if (!publicOnly) {
    if (!userId) {
      throw new Error(
        "Authentification requise pour voir toutes les collections",
      );
    }
    if (!isStaff) {
      throw new Error(
        "Accès refusé : réservé aux modérateurs et administrateurs",
      );
    }
  }
  // Validation de la limite
  if (limit < 0 || !Number.isInteger(limit)) {
    throw new Error("La limite doit être un entier positif");
  }

  if (limit > MAX_COLLECTION_LIMIT) {
    throw new Error(`La limite ne peut pas dépasser ${MAX_COLLECTION_LIMIT}`);
  }

  const skip = (page - 1) * limit;

  const allCollections = publicOnly
    ? await getPublicCollections()
    : await getAllCollections();

  // Appliquer les filtres type et search
  let filteredCollections = allCollections;

  if (type) {
    filteredCollections = filteredCollections.filter(
      (col) => col.type === type,
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredCollections = filteredCollections.filter((col) =>
      col.name.toLowerCase().includes(searchLower),
    );
  }

  // Paginer (les collections sont déjà triées par date dans le repository)
  const paginatedCollections = filteredCollections.slice(skip, skip + limit);

  // Injecter isStaff si nécessaire
  const finalCollections = isStaff
    ? paginatedCollections.map((col) => ({ ...col, isStaff: true }))
    : paginatedCollections;

  const total = filteredCollections.length;
  const totalPages = Math.ceil(total / limit);

  return {
    collections: finalCollections,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const fetchCollectionsByUser = async (
  userId: string,
  limit: number = DEFAULT_COLLECTION_LIMIT,
  page: number = 1,
  type?: string,
  search?: string,
  visibility?: "owned" | "private" | "public" | "shared" | "shared-with-me",
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }

  // Validation de la limite
  if (limit < 0 || !Number.isInteger(limit)) {
    throw new Error("La limite doit être un entier positif");
  }

  if (limit > MAX_COLLECTION_LIMIT) {
    throw new Error(`La limite ne peut pas dépasser ${MAX_COLLECTION_LIMIT}`);
  }

  const skip = (page - 1) * limit;

  // Cas 1: Collections partagées avec moi
  if (visibility === "shared-with-me") {
    // Récupérer les shares acceptés
    const acceptedShares = await getAcceptedSharesByGuestId(userId);
    const sharedCollectionIds = acceptedShares.map(
      (share) => share.collectionId,
    );

    if (sharedCollectionIds.length === 0) {
      return {
        collections: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    // Récupérer toutes les collections partagées avec filtres (déjà triées par date dans le repo)
    const allSharedCollections = await getCollectionsByIds(
      sharedCollectionIds,
      type,
      search,
      undefined,
    );

    // Enrichir avec les droits de partage
    const enrichedCollections = allSharedCollections.map((col) => {
      const share = acceptedShares.find(
        (s) => s.collectionId.toString() === col._id.toString(),
      );
      return {
        ...col,
        owned: false,
        rights: share?.rights,
      };
    });

    // Paginer
    const paginatedCollections = enrichedCollections.slice(skip, skip + limit);
    const total = enrichedCollections.length;
    const totalPages = Math.ceil(total / limit);

    return {
      collections: paginatedCollections,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // Cas 2: Mes collections (owned)
  let visibilityFilter: string | undefined;

  if (visibility === "private") visibilityFilter = "private";
  else if (visibility === "public") visibilityFilter = "public";
  else if (visibility === "shared") visibilityFilter = "shared";
  // Si visibility === "owned" ou undefined, visibilityFilter reste undefined (toutes)

  // Récupérer toutes les collections owned avec filtres (déjà triées par date dans le repo)
  const allOwnedCollections = await getCollectionsByUserIdWithFilters(
    userId,
    type,
    search,
    visibilityFilter,
  );

  // Enrichir avec owned: true
  const enrichedCollections = allOwnedCollections.map((col) => ({
    ...col,
    owned: true,
  }));

  // Paginer
  const paginatedCollections = enrichedCollections.slice(skip, skip + limit);
  const total = enrichedCollections.length;
  const totalPages = Math.ceil(total / limit);

  return {
    collections: paginatedCollections,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const fetchCollectionById = async (
  collectionId: string,
  userId?: string,
  isStaff: boolean = false,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  // Si la collection est publique, tout le monde peut la voir
  if (collection.visibility === "public") {
    // Déterminer si l'utilisateur est le propriétaire
    const owned = userId ? collection.authorId.toString() === userId : false;
    return {
      ...collection.toObject(),
      owned,
      isStaff,
      rights: owned ? "edit" : "read",
    };
  }

  // Pour les collections privées ou partagées, authentification obligatoire
  if (!userId) {
    throw new Error("Authentification requise pour accéder à cette collection");
  }

  const { rights, isOwner } = await checkCollectionAccessRights(
    collectionId,
    userId,
    isStaff,
  );

  if (rights === "none") {
    throw new Error("Accès refusé à cette collection");
  }

  return {
    ...collection.toObject(),
    owned: isOwner,
    isStaff,
    rights,
  };
};

export const updateCollectionById = async (
  collectionId: string,
  userId: string,
  updates: Partial<ICollection>,
  isStaff: boolean = false,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const { collection, rights, isOwner } = await checkCollectionAccessRights(
    collectionId,
    userId,
    isStaff,
  );

  if (rights !== "edit") {
    throw new Error("Accès refusé à cette collection");
  }

  // Seul le propriétaire (ou staff) peut modifier le nom, le type et la visibilité
  if (
    !isOwner &&
    !isStaff &&
    (updates.name || updates.type || updates.visibility)
  ) {
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

  // Préparer les mises à jour
  const safeUpdates: Record<string, string | Types.ObjectId[]> = {};
  if (updates.name) safeUpdates.name = updates.name;
  if (updates.type) safeUpdates.type = updates.type;
  if (updates.visibility) safeUpdates.visibility = updates.visibility;
  if (updates.works !== undefined) safeUpdates.works = updates.works;

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

  const updated = await updateCollection(collectionId, safeUpdates);
  if (!updated) throw new Error("Échec de la mise à jour de la collection");

  return updated;
};

export const deleteCollectionById = async (
  collectionId: string,
  userId: string,
  isStaff: boolean = false,
) => {
  if (!Types.ObjectId.isValid(collectionId)) {
    throw new Error("Identifiant de collection invalide");
  }

  const { isOwner } = await checkCollectionAccessRights(
    collectionId,
    userId,
    isStaff,
  );

  if (!isOwner && !isStaff) {
    throw new Error("Seul le propriétaire peut supprimer cette collection");
  }

  const deleted = await deleteCollection(collectionId);
  if (!deleted) throw new Error("Échec de la suppression de la collection");

  return deleted;
};
