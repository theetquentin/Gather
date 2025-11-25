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
  return await Collection.countDocuments({ name: tag, authorId: userId });
};

export const getCollectionById = async (collectionId: string) => {
  return await Collection.findById(collectionId).populate("works", "-reviews");
};

export const getCollectionWorkIds = async (collectionId: string) => {
  const collection = await Collection.findById(collectionId)
    .select("works")
    .lean();
  return collection?.works || [];
};

export const countWorksAlreadyInCollection = async (
  collectionId: string,
  workIds: Types.ObjectId[],
) => {
  const count = await Collection.countDocuments({
    _id: collectionId,
    works: { $in: workIds },
  });
  return count;
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

export const getAllCollections = async () => {
  return await Collection.find()
    .populate("authorId", "username email profilePicture")
    .populate("works", "-reviews")
    .sort({ createdAt: -1 })
    .lean();
};

export const getCollectionsByUserId = async (userId: string) => {
  return await Collection.find({ authorId: userId })
    .populate("authorId", "username email profilePicture")
    .populate("works", "-reviews")
    .sort({ createdAt: -1 })
    .lean();
};

export const getPublicCollections = async () => {
  return await Collection.find({ visibility: "public" })
    .populate("authorId", "username email profilePicture")
    .populate("works", "-reviews")
    .sort({ createdAt: -1 })
    .lean();
};

export const updateCollection = async (
  collectionId: string,
  data: Partial<ICollection>,
) => {
  return await Collection.findByIdAndUpdate(collectionId, data, { new: true });
};

export const deleteCollection = async (collectionId: string) => {
  return await Collection.findByIdAndDelete(collectionId);
};

export const getCollectionsByUserIdWithFilters = async (
  userId: string,
  type?: string,
  search?: string,
  visibility?: string,
) => {
  const filters: Record<string, unknown> = { authorId: userId };

  if (type) filters.type = type;
  if (search) filters.name = { $regex: search, $options: "i" };
  if (visibility) filters.visibility = visibility;

  return await Collection.find(filters)
    .populate("authorId", "username email profilePicture")
    .populate("works", "-reviews")
    .sort({ createdAt: -1 })
    .lean();
};

export const getCollectionsByIds = async (
  collectionIds: Types.ObjectId[],
  type?: string,
  search?: string,
  visibility?: string,
) => {
  const filters: Record<string, unknown> = { _id: { $in: collectionIds } };

  if (type) filters.type = type;
  if (search) filters.name = { $regex: search, $options: "i" };
  if (visibility) filters.visibility = visibility;

  return await Collection.find(filters)
    .populate("authorId", "username email profilePicture")
    .populate("works", "-reviews")
    .sort({ createdAt: -1 })
    .lean();
};
