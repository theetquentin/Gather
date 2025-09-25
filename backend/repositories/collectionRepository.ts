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

export const getCollectionById = async (collectionId: string) => {
  return await Collection.findById(collectionId);
};

export const addWorkToCollectionByIds = async (
  collectionId: string,
  workObjectId: Types.ObjectId,
) => {
  return await Collection.findByIdAndUpdate(
    collectionId,
    { $addToSet: { works: workObjectId } },
    { new: true },
  );
};

export const addWorksToCollectionByIds = async (
  collectionId: string,
  workObjectIds: Types.ObjectId[],
) => {
  if (!workObjectIds || workObjectIds.length === 0)
    return await Collection.findById(collectionId);
  return await Collection.findByIdAndUpdate(
    collectionId,
    { $addToSet: { works: { $each: workObjectIds } } },
    { new: true },
  );
};
