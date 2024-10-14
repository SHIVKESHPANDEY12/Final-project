import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Department, Team } from "../models/department.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Discussion } from "../models/discussion.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";
import { CourseDiscussion } from "../models/courseDiscussion.model.js";

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

const clearCookiesOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    // If password is incorrect
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set token in an HTTP-only cookie
    res.cookie("token", token, cookiesOptions);

    // Create a new user object without the password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password; // Remove password from the user object

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword, // Send user object without password
    });
  } catch (error) {
    // Handle server error
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  const { email, password, username, department, team } = req.body;

  // Check if all required fields are provided
  if (!email || !password || !username || !department || !team) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Check if the department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Check if the team exists
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Create a new user
    const newUser = new User({
      email,
      password,
      userType: "employee", // Default userType is employee
      department,
      team,
      username,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

export const logoutUser = (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", clearCookiesOptions);

    // Send success response
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during logout",
      error: error.message,
    });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = req._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.userData = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

export const getAllUserData = async (req, res) => {
  const userId = req.params.userId;

  try {
    const topScorers = await Quiz.aggregate([
      {
        $group: {
          _id: "$userId",
          totalScore: { $max: "$score" },
        },
      },
      {
        $sort: { totalScore: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          name: "$userDetails.username",
          totalScore: 1,
        },
      },
    ]);

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate("courseId", "title");

    const discussions = await Discussion.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    const enrolledCourses = await Enrollment.find({ userId }).select(
      "courseId"
    );
    const enrolledCourseIds = enrolledCourses.map(
      (enrollment) => enrollment.courseId
    );
    const availableCourses = await Course.find({
      _id: { $nin: enrolledCourseIds },
    });

    const enrolledCoursesData = await Enrollment.find({ userId })
      .populate("courseId")
      .sort({ enrollmentDate: -1 });

    const responseData = {
      topScorers,
      recentQuizzes,
      discussions,
      availableCourses,
      enrolledCourses: enrolledCoursesData,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCourseDiscussions = async (req, res) => {
  const { courseId } = req.params;

  try {
    const discussions = await CourseDiscussion.find({ courseId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    if (!discussions.length) {
      return res.status(200).json({
        success: false,
        message: "No discussions found for this course.",
        discussions: [],
      });
    }

    res.status(200).json({
      success: true,
      discussions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const addCourseDiscussion = async (req, res) => {
  const { message, userId, courseId } = req.body;

  // Validate input
  if (!message || !userId || !courseId) {
    return res.status(400).json({
      success: false,
      message: "Message, userId, and courseId are required.",
    });
  }

  try {
    // Create a new discussion object
    const newDiscussion = new CourseDiscussion({
      message: message.trim(),
      userId,
      courseId,
    });

    // Save the discussion to the database
    const savedDiscussion = await newDiscussion.save();

    res.status(201).json({
      success: true,
      message: "Discussion added successfully",
      discussion: savedDiscussion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add discussion",
      error: error.message,
    });
  }
};

export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Discussions fetched successfully.",
      messages: discussions,
    });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussions.",
      error: error.message,
    });
  }
};

export const deleteDiscussionMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Discussion.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Discussion message not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Discussion message deleted successfully.",
      data: deletedMessage,
    });
  } catch (error) {
    console.error("Error deleting discussion message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete discussion message.",
      error: error.message,
    });
  }
};

export const dummyDataController = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);
  try {
    const users = [
      {
        name: "User 1",
        email: "user1@jmangroup.com",
        userType: "employee",
        password: hashedPassword,
      },
      {
        name: "User 2",
        email: "user2@jmangroup.com",
        userType: "employee",
        password: hashedPassword,
      },
      {
        name: "User 3",
        email: "user3@jmangroup.com",
        userType: "employee",
        password: hashedPassword,
      },
      {
        name: "User 4",
        email: "user4@jmangroup.com",
        userType: "employee",
        password: hashedPassword,
      },
      {
        name: "User 5",
        email: "user5@jmangroup.com",
        userType: "employee",
        password: hashedPassword,
      },
    ];

    const insertedUsers = await User.insertMany(users);
    const courses = await Course.find();

    for (const user of insertedUsers) {
      const enrolledCourseIds = new Set();

      while (enrolledCourseIds.size < 2) {
        const randomCourse =
          courses[Math.floor(Math.random() * courses.length)];

        const existingEnrollment = await Enrollment.findOne({
          userId: user._id,
          courseId: randomCourse._id,
        });

        if (!existingEnrollment) {
          const enrollmentDeadline = new Date();
          enrollmentDeadline.setDate(
            enrollmentDeadline.getDate() + randomCourse.deadline
          );

          await Enrollment.create({
            userId: user._id,
            courseId: randomCourse._id,
            deadlineDate: enrollmentDeadline,
          });
          enrolledCourseIds.add(randomCourse._id);
        }
      }
    }

    const messages = [
      "This is my first message.",
      "I really enjoyed this course!",
      "Can anyone help me with this topic?",
      "Looking forward to the next lesson.",
      "I have a question about the quiz.",
    ];

    for (const user of insertedUsers) {
      for (let i = 0; i < 2; i++) {
        const randomMessage =
          messages[Math.floor(Math.random() * messages.length)];
        await Discussion.create({ userId: user._id, message: randomMessage });
      }
    }

    for (const user of insertedUsers) {
      const enrollments = await Enrollment.find({ userId: user._id }).populate(
        "courseId"
      );

      for (const enrollment of enrollments) {
        for (let i = 0; i < 2; i++) {
          const randomScore = Math.floor(Math.random() * 101);
          await Quiz.create({
            userId: user._id,
            courseId: enrollment.courseId._id,
            score: randomScore,
          });
        }
      }
    }

    return res
      .status(201)
      .json({ message: "Dummy data inserted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addNewDiscussionMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    const newMessage = new Discussion({
      userId,
      message,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Discussion message added successfully.",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Error adding discussion message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add discussion message.",
      error: error.message,
    });
  }
};

export const enrollUserInCourse = async (req, res) => {
  const { userId, courseId, deadlineDate } = req.body;

  try {
    const enrollment = new Enrollment({
      userId,
      courseId,
      deadlineDate,
    });
    await enrollment.save();

    res.status(201).json({
      success: true,
      message: "User enrolled in the course successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to enroll user in the course",
      error,
    });
  }
};

export const updateProgress = async (req, res) => {
  const { enrollmentId, progressPercentage } = req.body;

  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { progressPercentage },
      { new: true }
    );

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found." });
    }

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error,
    });
  }
};

export const getEnrollmentDetails = async (req, res) => {
  const { enrollmentId } = req.params;

  try {
    const enrollment = await Enrollment.findById(enrollmentId).populate(
      "userId courseId"
    );

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found." });
    }

    res.status(200).json({
      success: true,
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve enrollment details",
      error,
    });
  }
};
