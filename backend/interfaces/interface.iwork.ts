import { Types } from "mongoose";

export interface IWork {
  title: string;
  author: string;
  publishedAt: Date;
  type: string;
  genre: string;
  evaluations?: Types.ObjectId[]; // refs vers Evaluation
  createdAt: Date;
  updatedAt: Date;
}
