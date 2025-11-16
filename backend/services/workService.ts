import { Types } from "mongoose";
import validator from "validator";
import {
  getAllWorks,
  countWorksByIds,
  getWorkTypesByIds,
  getWorkById,
} from "../repositories/workRepository";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Récupère la liste des œuvres avec validation, sanitization et filtres
 */
export const getWorks = async (
  limit?: number,
  type?: string,
  search?: string,
  genre?: string[],
  year?: string,
) => {
  // Validation de la limite
  if (limit !== undefined && (limit < 0 || !Number.isInteger(limit))) {
    throw new Error("La limite doit être un entier positif");
  }

  if (limit !== undefined && limit > MAX_LIMIT) {
    throw new Error(`La limite ne peut pas dépasser ${MAX_LIMIT}`);
  }

  const finalLimit = limit ?? DEFAULT_LIMIT;

  // Validation et sanitization de la recherche
  let sanitizedSearch: string | undefined = undefined;
  if (search && search.trim()) {
    const trimmedSearch = search.trim();

    // Validation de la longueur
    if (!validator.isLength(trimmedSearch, { min: 1, max: 100 })) {
      throw new Error("La recherche doit contenir entre 1 et 100 caractères");
    }

    // Sanitization: échapper les caractères spéciaux de regex pour éviter l'injection NoSQL
    sanitizedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return await getAllWorks(finalLimit, type, sanitizedSearch, genre, year);
};

/**
 * Récupère une œuvre par son ID
 * @param id - ID de l'œuvre
 * @throws Error si l'ID n'est pas valide ou si l'œuvre n'existe pas
 */
export const getWork = async (id: string) => {
  // Validation de l'ID
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("ID invalide");
  }

  const work = await getWorkById(new Types.ObjectId(id));
  if (!work) {
    throw new Error("Œuvre introuvable");
  }

  return work;
};

/**
 * Valide qu'une liste d'œuvres existe dans la base
 * @param workIds - Liste d'ObjectIds à valider
 * @throws Error si certaines œuvres n'existent pas
 */
export const validateWorksExist = async (
  workIds: Types.ObjectId[],
): Promise<void> => {
  if (!workIds || workIds.length === 0) {
    return;
  }

  const count = await countWorksByIds(workIds);
  if (count !== workIds.length) {
    throw new Error("Certaines œuvres n'existent pas");
  }
};

/**
 * Valide que les œuvres correspondent au type attendu
 * @param workIds - Liste d'ObjectIds à valider
 * @param expectedType - Type attendu (book, movie, etc.)
 * @returns IDs des œuvres qui ne correspondent pas au type
 */
export const validateWorksType = async (
  workIds: Types.ObjectId[],
  expectedType: string,
): Promise<string[]> => {
  if (!workIds || workIds.length === 0) {
    return [];
  }

  const types = await getWorkTypesByIds(workIds);
  const mismatchedIds = types
    .filter((t) => t.type !== expectedType)
    .map((t) => t._id.toString());

  return mismatchedIds;
};

/**
 * Valide et catégorise une liste d'œuvres
 * @param workIds - Liste d'ObjectIds à valider
 * @param expectedType - Type attendu (book, movie, etc.)
 * @returns Objet contenant les IDs existants, non-existants et incompatibles
 */
export const validateAndCategorizeWorks = async (
  workIds: Types.ObjectId[],
  expectedType: string,
): Promise<{
  existingIds: Set<string>;
  nonexistentIds: string[];
  mismatchedIds: string[];
}> => {
  if (!workIds || workIds.length === 0) {
    return {
      existingIds: new Set(),
      nonexistentIds: [],
      mismatchedIds: [],
    };
  }

  // Récupérer les types de toutes les œuvres valides
  const types = await getWorkTypesByIds(workIds);
  const existingIds = new Set(types.map((t) => t._id.toString()));

  // Identifier les œuvres non existantes
  const nonexistentIds = workIds
    .map((oid) => oid.toString())
    .filter((id) => !existingIds.has(id));

  // Identifier les œuvres avec un type incompatible
  const mismatchedIds = types
    .filter((t) => t.type !== expectedType)
    .map((t) => t._id.toString());

  return {
    existingIds,
    nonexistentIds,
    mismatchedIds,
  };
};
