import { Schema, model } from "mongoose";
import { IReview } from "../interfaces/interface.ireview";

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workId: {
      type: Schema.Types.ObjectId,
      ref: "Work",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      minLength: 3,
      maxLength: 500,
    },
  },
  { timestamps: true },
);

const Review = model("Review", reviewSchema);

export default Review;
