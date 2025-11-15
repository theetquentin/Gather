import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/interface.iuser";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true, // évite les doublons
      lowercase: true,
      trim: true,
      maxLength: 100,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 255,
    },
    role: {
      type: String,
      enum: ["admin", "user", "moderator"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = model("User", userSchema);

export default User;
