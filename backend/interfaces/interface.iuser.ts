import { Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user" | "moderator";
  profilePicture?: string;
  collections?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
