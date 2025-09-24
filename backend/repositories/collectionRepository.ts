import Collection from "../models/Collection";
import { ICollection } from "../interfaces/interface.icollection";
import { Types } from "mongoose";

export const createCollection = async (data: ICollection) => {
  return await Collection.create({ ...data });
};

export const countCollectionByNameByUser = async (
  tag: string,
  userId: Types.ObjectId,
) => {
  return await Collection.countDocuments({ name: tag, userId: userId });
};
