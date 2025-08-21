import { model, Schema } from "mongoose";
import { IShare } from "../interfaces/interface.ishare";

const shareSchema = new Schema<IShare>(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rights: {
      type: String,
      enum: ["read", "edit"],
      default: "read",
    },
    status: {
      type: String,
      enum: ["pending", "refused", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Share = model("Share", shareSchema);

export default Share;
