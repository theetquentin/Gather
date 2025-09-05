import { Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user" | "moderator";
  collections?: Types.ObjectId[];
  shared?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
