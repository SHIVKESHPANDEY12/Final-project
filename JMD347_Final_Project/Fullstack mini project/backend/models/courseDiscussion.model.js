import mongoose from "mongoose";

const courseDiscussionSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CourseDiscussion = mongoose.model(
  "CourseDiscussion",
  courseDiscussionSchema
);
