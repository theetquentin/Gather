import Share from "../models/Share";
import { IShare } from "../interfaces/interface.ishare";
import { Types } from "mongoose";

export const createShare = async (data: IShare) => {
  return await Share.create({ ...data });
};

export const getShareById = async (shareId: string) => {
  return await Share.findById(shareId)
    .populate("collectionId", "name type visibility")
    .populate("guestId", "username email")
    .populate("authorId", "username email");
};

export const getSharesByCollectionId = async (collectionId: string) => {
  return await Share.find({ collectionId })
    .populate("guestId", "username email")
    .populate("authorId", "username email");
};

export const getSharesByGuestId = async (guestId: string) => {
  return await Share.find({ guestId })
    .populate("collectionId", "name type visibility")
    .populate("authorId", "username email");
};

export const getAcceptedShareByCollectionAndGuest = async (
  collectionId: Types.ObjectId,
  guestId: Types.ObjectId,
) => {
  return await Share.findOne({
    collectionId,
    guestId,
    status: "accepted",
  });
};

export const updateShareStatus = async (
  shareId: string,
  status: "pending" | "refused" | "accepted",
) => {
  return await Share.findByIdAndUpdate(shareId, { status }, { new: true });
};

export const updateShare = async (shareId: string, data: Partial<IShare>) => {
  return await Share.findByIdAndUpdate(shareId, data, { new: true });
};

export const deleteShare = async (shareId: string) => {
  return await Share.findByIdAndDelete(shareId);
};

export const deleteSharesByCollectionId = async (collectionId: string) => {
  return await Share.deleteMany({ collectionId });
};
