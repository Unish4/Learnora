import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must have a student"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Review must have a course"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum 1"],
      max: [5, "Maximum 5"],
    },
    comment: {
      type: String,
      maxlength: [1000, "Comment too long"],
      default: "",
    },
  },
  { timestamps: true },
);

reviewSchema.index({ student: 1, course: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
