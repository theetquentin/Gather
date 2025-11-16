import { Types } from "mongoose";
import Work from "../models/Work";

export const countWorksByIds = async (ids: Types.ObjectId[]) => {
  if (!ids || ids.length === 0) return 0;
  return await Work.countDocuments({ _id: { $in: ids } });
};

export const existsWorkById = async (id: Types.ObjectId) => {
  const count = await Work.countDocuments({ _id: id });
  return count > 0;
};

export const getWorkTypeById = async (id: Types.ObjectId) => {
  const work = await Work.findById(id).select("type").lean();
  return work ? (work as { type: string }).type : null;
};

export const getWorkTypesByIds = async (ids: Types.ObjectId[]) => {
  if (!ids || ids.length === 0)
    return [] as { _id: Types.ObjectId; type: string }[];
  const docs = await Work.find({ _id: { $in: ids } })
    .select("_id type")
    .lean();
  return docs as { _id: Types.ObjectId; type: string }[];
};

export const getWorkById = async (id: Types.ObjectId) => {
  return await Work.findById(id).lean();
};

/**
 * Récupère toutes les œuvres avec filtres et recherche (SANITIZÉS par le service)
 * @param limit - Nombre maximum d'œuvres à retourner
 * @param type - Type d'œuvre à filtrer
 * @param search - Terme de recherche DÉJÀ SANITIZÉ (caractères regex échappés)
 * @param genre - Liste de genres à filtrer (ET logique - l'œuvre doit contenir TOUS les genres)
 * @param year - Année à filtrer (peut être une année ou "before-1900")
 */
export const getAllWorks = async (
  limit?: number,
  type?: string,
  search?: string,
  genre?: string[],
  year?: string,
) => {
  const filter: Record<string, unknown> = {};

  // Filtre par type
  if (type) {
    filter.type = type;
  }

  // Filtre par genres (genre est un tableau dans le modèle)
  // Cherche les œuvres qui contiennent TOUS les genres sélectionnés (ET logique)
  if (genre && genre.length > 0) {
    filter.genre = { $all: genre };
  }

  // Filtre par année
  if (year) {
    if (year === "before-1900") {
      // Œuvres publiées avant le 1er janvier 1900
      filter.publishedAt = { $lt: new Date("1900-01-01") };
    } else {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        // Œuvres publiées dans l'année spécifique
        filter.publishedAt = {
          $gte: new Date(`${yearNum}-01-01`),
          $lt: new Date(`${yearNum + 1}-01-01`),
        };
      }
    }
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }

  const query = Work.find(filter).lean();

  // Tri par date de publication décroissante (les plus récentes en premier)
  query.sort({ publishedAt: -1 });

  if (limit && limit > 0) {
    query.limit(limit);
  }

  return await query.exec();
};
