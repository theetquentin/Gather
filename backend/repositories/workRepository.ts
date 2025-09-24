import { Types } from "mongoose";
import Work from "../models/Work";

export const countWorksByIds = async (ids: Types.ObjectId[]) => {
  if (!ids || ids.length === 0) return 0;
  return await Work.countDocuments({ _id: { $in: ids } });
};
