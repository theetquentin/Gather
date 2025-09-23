import { Schema, model } from "mongoose";
import { IWork } from "../interfaces/interface.iwork";

const workSchema = new Schema<IWork>(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
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
      type: String,
      required: true,
    },
    images: [
      {
        type: [],
        required: false,
      },
    ],
    evaluations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Evaluation",
      },
    ],
  },
  { timestamps: true },
);

const Work = model("Work", workSchema);

export default Work;
