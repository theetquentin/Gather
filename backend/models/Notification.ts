import { Schema, model } from "mongoose";
import { INotification } from "../interfaces/interface.inotification";

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
    workId: {
      type: Schema.Types.ObjectId,
      ref: "Work",
    },
    type: {
      type: String,
      enum: ["review", "share", "alert"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Notification = model("Notification", notificationSchema);

export default Notification;
