import { Types } from "mongoose";

export interface ICollection {
  name: string;
  type: string;
  visibility?: "public" | "private" | "shared";
  authorId: Types.ObjectId;
  works?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
