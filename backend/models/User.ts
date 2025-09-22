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
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    role: {
      type: String,
      enum: ["admin", "user", "moderator"],
      default: "user",
    },
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    shared: [
      {
        type: Schema.Types.ObjectId,
        ref: "Share",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = model("User", userSchema);

export default User;
