import { Types } from "mongoose";

export interface IWork {
  title: string;
  author: string;
  publishedAt: Date;
  type: string;
  genre: string[];
  images?: string[];
  reviews?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
