import express from "express";
import {
  addCourseDiscussion,
  addNewDiscussionMessage,
  createUser,
  deleteDiscussionMessage,
  dummyDataController,
  getAllDiscussions,
  getAllUserData,
  getCourseDiscussions,
  getUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { CourseDiscussion } from "../models/courseDiscussion.model.js";
import { User } from "../models/user.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";

const router = express.Router();

router.post("/create", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protect this route
router.get("/profile", verifyToken, getUser, (req, res) => {
  res.status(200).json({ success: true, user: req.userData });
});

router.get("/user-data/:userId", getAllUserData);

router.post("/addNewDiscussionMessage", addNewDiscussionMessage);

router.get("/getDiscussionMessages", getAllDiscussions);

router.delete("/deleteDiscussionMessage/:id", deleteDiscussionMessage);

router.post("/course/discussion", addCourseDiscussion);

router.get("/course/:courseId/discussions", getCourseDiscussions);

export const deleteDiscussion = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the discussion by ID
    const deletedDiscussion = await CourseDiscussion.findByIdAndDelete(id);

    // If the discussion was not found, return an error
    if (!deletedDiscussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found.",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Discussion deleted successfully.",
    });
  } catch (error) {
    // Error response
    res.status(500).json({
      success: false,
      message: "Failed to delete discussion.",
      error: error.message,
    });
  }
};

router.delete("/course/discussions/:id", deleteDiscussion);

router.get("/insert-dummy-data", dummyDataController);

router.get("/fetchStatistics", async (req, res) => {
  try {
    // Fetch total employees
    const totalEmployees = await User.countDocuments({ userType: "employee" });

    // Fetch total courses
    const totalCourses = await Course.countDocuments();

    // Fetch total hours (this is assumed based on courses, can be adjusted as per your logic)
    // For example, if each course has a 'deadline' that represents hours, we can sum those up
    // const totalHoursAgg = await Course.aggregate([
    //   { $group: { _id: null, totalHours: { $sum: "$deadline" } } },
    // ]);
    // const totalHours = totalHoursAgg[0]?.totalHours || 0;

    // Fetch average quiz score
    const averageQuizScoreAgg = await Quiz.aggregate([
      { $group: { _id: null, averageQuizScore: { $avg: "$score" } } },
    ]);
    const averageQuizScore = averageQuizScoreAgg[0]?.averageQuizScore || 0;

    // Send the statistics as response
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalHours: 50,
        totalCourses,
        averageQuizScore,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

router.get("/topPerformers", async (req, res) => {
  try {
    // Aggregation pipeline to fetch top 5 performers based on highest quiz scores
    const topScorers = await Quiz.aggregate([
      {
        $group: {
          _id: "$userId",
          totalScore: { $max: "$score" }, // Get the highest score for each user
        },
      },
      {
        $sort: { totalScore: -1 }, // Sort by total score in descending order
      },
      {
        $limit: 5, // Limit to top 5 users
      },
      {
        $lookup: {
          from: "users", // Join with the 'users' collection
          localField: "_id", // Use userId (_id from Quiz collection)
          foreignField: "_id", // Match with _id in the User collection
          as: "userDetails", // Alias the joined data as userDetails
        },
      },
      {
        $unwind: "$userDetails", // Unwind the array returned by the lookup
      },
      {
        $project: {
          name: "$userDetails.username", // Project username from userDetails
          totalScore: 1, // Include totalScore from the aggregation
        },
      },
    ]);

    // Send the top performers as a response
    res.status(200).json({
      success: true,
      data: topScorers,
    });
  } catch (error) {
    console.error("Error fetching top performers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top performers",
      error: error.message,
    });
  }
});

router.get("/getAllUserStatistics", async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find()
      .select("username department team")
      .populate("department","name")
      .populate("team","name")
      .lean();

    // Prepare an array to hold user statistics
    const userStatistics = await Promise.all(
      users.map(async (user, index) => {
        // Fetch completed courses based on progress
        const completedCourses = await Enrollment.countDocuments({
          userId: user._id,
          status: "completed",
        });

        // Fetch total time based on completed courses (assuming totalTime is stored in Enrollment)
        const totalTime = await Enrollment.aggregate([
          { $match: { userId: user._id, status: "completed" } },
          { $group: { _id: null, totalTime: { $sum: "$totalTime" } } },
        ]);

        // Calculate average quiz score
        const quizResults = await Quiz.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, averageScore: { $avg: "$score" } } },
        ]);

        // Get the average score or default to 0
        const averageQuizScore = quizResults[0]?.averageScore || 0;

        return {
          id: index + 1, // Assigning an ID based on the index for simplicity
          name: user.username,
          department: user.department,
          team: user.team,
          coursesCompleted: completedCourses,
          totalTime: totalTime[0]?.totalTime || 0, // Default to 0 if no time found
          averageQuizScore: averageQuizScore.toFixed(2), // Format the average score to 2 decimal places
        };
      })
    );

    // Format the response
    res.status(200).json({
      success: true,
      data: userStatistics,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics.",
      error: error.message,
    });
  }
});
export default router;
