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

export const getAllWorks = async (limit?: number) => {
  const query = Work.find().lean();

  // Tri par date de publication décroissante (les plus récentes en premier)
  query.sort({ publishedAt: -1 });

  if (limit && limit > 0) {
    query.limit(limit);
  }

  return await query.exec();
};
