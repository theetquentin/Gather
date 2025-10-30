import { Schema, model } from "mongoose";
import { ICollection } from "../interfaces/interface.icollection";

enum CollectionType {
  BOOK = "book",
  MOVIE = "movie",
  SERIES = "series",
  MUSIC = "music",
  GAME = "game",
  OTHER = "other",
}

const collectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(CollectionType),
    },
    visibility: {
      type: String,
      enum: ["public", "private", "shared"],
      default: "private",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    works: [
      {
        type: Schema.Types.ObjectId,
        ref: "Work",
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

const Collection = model("Collection", collectionSchema);

export default Collection;
