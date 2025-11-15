import { Types } from "mongoose";

export interface ICollection {
  name: string;
  type: string;
  visibility?: "public" | "private" | "shared";
  userId: Types.ObjectId;
  works?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
