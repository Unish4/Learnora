import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Lesson must belong to a course"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
    },
    content: {
      type: String,
      default: "",
      maxlength: [10000, "Content too long"],
    },
    videoUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // Minutes
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false, // Preview lessons
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;
