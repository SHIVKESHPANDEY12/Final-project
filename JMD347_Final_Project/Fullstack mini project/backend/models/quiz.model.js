import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
