import { Types } from "mongoose";

export interface ICollection {
  name: string;
  type: string;
  visibility?: "public" | "private" | "shared";
  userId: Types.ObjectId;
  works?: Types.ObjectId[];
  shared?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
