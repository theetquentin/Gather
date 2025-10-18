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
  if (collection.userId.toString() !== userId) {
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

export const fetchCollectionsByUser = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Identifiant utilisateur invalide");
  }
  return await getCollectionsByUserId(userId);
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

  if (collection.visibility === "private" && userId) {
    if (collection.userId.toString() !== userId) {
      throw new Error("Accès refusé à cette collection");
    }
  }

  return collection;
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

  if (collection.userId.toString() !== userId) {
    throw new Error("Accès refusé à cette collection");
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

  const safeUpdates: Record<string, string> = {};
  if (updates.name) safeUpdates.name = updates.name;
  if (updates.type) safeUpdates.type = updates.type;
  if (updates.visibility) safeUpdates.visibility = updates.visibility;

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
