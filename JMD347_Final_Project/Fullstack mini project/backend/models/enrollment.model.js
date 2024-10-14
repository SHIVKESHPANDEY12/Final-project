import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["on-going", "completed"],
      default: "on-going",
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    deadlineDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
