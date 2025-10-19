import { getAllWorks } from "../repositories/workRepository";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const getWorks = async (
  limit?: number,
  type?: string,
  search?: string,
) => {
  if (limit !== undefined && (limit < 0 || !Number.isInteger(limit))) {
    throw new Error("La limite doit être un entier positif");
  }

  if (limit !== undefined && limit > MAX_LIMIT) {
    throw new Error(`La limite ne peut pas dépasser ${MAX_LIMIT}`);
  }

  const finalLimit = limit ?? DEFAULT_LIMIT;
  return await getAllWorks(finalLimit, type, search);
};
