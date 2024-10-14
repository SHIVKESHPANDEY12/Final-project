import express from "express";
import {
  fetchAvailableCourses,
  insertDummyCourses,
} from "../controllers/course.controller.js";
import {
  enrollUserInCourse,
  updateProgress,
} from "../controllers/user.controller.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { CourseDiscussion } from "../models/courseDiscussion.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Feedback } from "../models/feedback.model.js";

const router = express.Router();

// router.get("/insert-dummy", insertDummyCourses);

router.post("/enroll", enrollUserInCourse);

router.post("/saveQuizResult", async (req, res) => {
  const { userId, courseId, score } = req.body;

  if (!userId || !courseId || score === undefined) {
    return res.status(400).json({
      success: false,
      message: "User ID, Course ID, and score are required",
    });
  }

  try {
    const quizResult = new Quiz({
      userId,
      courseId,
      score,
    });

    await quizResult.save();

    res.status(201).json({
      success: true,
      message: "Quiz score saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save quiz score",
      error: error.message,
    });
  }
});

router.get("/course/enrollment", async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    const enrollment = await Enrollment.findOne({ userId, courseId }).populate(
      "courseId"
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.status(200).json({
      success: true,
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/submitFeedback", async (req, res) => {
  const { userId, courseId, rating, feedbackText } = req.body;

  if (!userId || !courseId || rating === undefined || !feedbackText) {
    return res.status(400).json({
      success: false,
      message: "User ID, Course ID, rating, and feedback text are required",
    });
  }

  try {
    const feedback = new Feedback({
      userId,
      courseId,
      rating,
      feedbackText,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
});

router.put("/update-progress", updateProgress);
// router.get("/get-enrollment-details/:enrollmentId", getEnrollmentDetails);

export default router;
