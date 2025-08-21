import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/interface.iuser";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
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
