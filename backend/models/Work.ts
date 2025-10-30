import { Schema, model } from "mongoose";
import { IWork } from "../interfaces/interface.iwork";

const workSchema = new Schema<IWork>(
  {
    title: {
      type: String,
      required: true,
      maxLength: 255,
    },
    author: {
      type: String,
      required: true,
      maxLength: 255,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    genre: {
      type: [],
      required: true,
      maxLength: 50,
    },
    description: {
      type: String,
      required: false,
      maxLength: 500,
    },
    images: [
      {
        type: [],
        required: false,
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true },
);

const Work = model("Work", workSchema);

export default Work;
