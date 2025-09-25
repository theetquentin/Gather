import {
  createCollection,
  countCollectionByNameByUser,
} from "../repositories/collectionRepository";
import { Types } from "mongoose";
import { ICollection } from "../interfaces/interface.icollection";
import { getUserById } from "../repositories/userRepository";
import { countWorksByIds } from "../repositories/workRepository";
import {
  addWorkToCollectionByIds,
  getCollectionById,
} from "../repositories/collectionRepository";
import { existsWorkById } from "../repositories/workRepository";
import {
  getWorkTypeById,
  getWorkTypesByIds,
} from "../repositories/workRepository";
import { addWorksToCollectionByIds } from "../repositories/collectionRepository";

export const createNewCollection = async (data: ICollection) => {
  const { name, works, userId } = data;

  const countCollection = await countCollectionByNameByUser(name, userId);

  if (countCollection > 0)
    throw new Error("Vous avez déjà nommé une de vos collections ainsi");

  const user = await getUserById(userId.toString());

  if (!user) throw new Error("Utilisateur non trouvé");

  // Déduplication des works si fournis
  const uniqueWorks = works
    ? Array.from(new Set(works.map((w) => w.toString()))).map(
        (id) => new Types.ObjectId(id),
      )
    : undefined;

  // Vérification de l'existence des works
  if (uniqueWorks && uniqueWorks.length > 0) {
    const count = await countWorksByIds(uniqueWorks);
    if (count !== uniqueWorks.length) {
      throw new Error("Certaines œuvres n'existent pas");
    }

    // Vérifier que chaque work a un type égal au type de la collection
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

export const addWorkToCollection = async (
  collectionId: string,
  workId: string,
  userId: string,
) => {
  if (!Types.ObjectId.isValid(collectionId))
    throw new Error("Identifiant de collection invalide");
  if (!Types.ObjectId.isValid(workId))
    throw new Error("Identifiant d'œuvre invalide");

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");

  if (collection.userId.toString() !== userId)
    throw new Error("Accès refusé à cette collection");

  const workObjectId = new Types.ObjectId(workId);
  const exists = await existsWorkById(workObjectId);
  if (!exists) throw new Error("Œuvre inexistante");

  // Vérifier compatibilité de type work vs collection
  const workType = await getWorkTypeById(workObjectId);
  if (!workType) throw new Error("Œuvre inexistante");
  if (workType !== collection.type)
    throw new Error(
      "Le type de l'œuvre ne correspond pas au type de la collection",
    );

  const updated = await addWorkToCollectionByIds(collectionId, workObjectId);
  if (!updated) throw new Error("Échec de la mise à jour de la collection");

  return updated;
};

export const addWorksToCollection = async (
  collectionId: string,
  workIds: string[],
  userId: string,
) => {
  if (!Types.ObjectId.isValid(collectionId))
    throw new Error("Identifiant de collection invalide");
  if (!Array.isArray(workIds) || workIds.length === 0)
    throw new Error("Liste d'œuvres vide ou invalide");

  const collection = await getCollectionById(collectionId);
  if (!collection) throw new Error("Collection non trouvée");
  if (collection.userId.toString() !== userId)
    throw new Error("Accès refusé à cette collection");

  const validIds: Types.ObjectId[] = [];
  const invalidIds: string[] = [];
  for (const id of workIds) {
    if (Types.ObjectId.isValid(id)) validIds.push(new Types.ObjectId(id));
    else invalidIds.push(id);
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

  let updated = null;
  if (eligibleIds.length > 0) {
    updated = await addWorksToCollectionByIds(collectionId, eligibleIds);
    if (!updated) throw new Error("Échec de la mise à jour de la collection");
  } else {
    updated = collection;
  }

  return {
    updatedCollection: updated,
    invalidIds,
    nonexistentIds,
    mismatchedIds,
    addedCount: eligibleIds.length,
  };
};
