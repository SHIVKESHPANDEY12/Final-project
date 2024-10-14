import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";

export const insertDummyCourses = async (req, res) => {
  const courses = [
    {
      title: "Course Title 1",
      description: "Short description for course 1.",
      thumbnail: "https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg",
      deadline: 1,
      videoUrl: "https://www.youtube.com/watch?v=toSAAgLUHuk",
    },
    {
      title: "Course Title 2",
      description: "Short description for course 2.",
      thumbnail: "https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg",
      deadline: 2,
      videoUrl: "https://www.youtube.com/watch?v=toSAAgLUHuk",
    },
    {
      title: "Course Title 3",
      description: "Short description for course 3.",
      thumbnail: "https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg",
      deadline: 3,
      videoUrl: "https://www.youtube.com/watch?v=toSAAgLUHuk",
    },
    {
      title: "Course Title 4",
      description: "Short description for course 4.",
      thumbnail: "https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg",
      deadline: 4,
      videoUrl: "https://www.youtube.com/watch?v=toSAAgLUHuk",
    },
    {
      title: "Course Title 5",
      description: "Short description for course 5.",
      thumbnail: "https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg",
      deadline: 5,
      videoUrl: "https://www.youtube.com/watch?v=toSAAgLUHuk",
    },
    {
      title: "Course Title 6",
      description: "Short description for course 6.",
      thumbnail: "https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg",
      deadline: 6,
      videoUrl: "https://www.youtube.com/watch?v=toSAAgLUHuk",
    },
  ];

  try {
    await Course.insertMany(courses);
    res.status(201).json({
      success: true,
      message: "Dummy courses created successfully",
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create dummy courses",
      error,
    });
  }
};

export const fetchAvailableCourses = async (req, res) => {
  const { userId } = req.params;

  try {
    const enrolledCourses = await Enrollment.find({ userId })
      .select("courseId progress")
      .lean();

    const enrolledCourseIds = enrolledCourses.map((course) => course.courseId);

    const availableCourses = await Course.find({
      _id: { $nin: enrolledCourseIds },
      deadline: { $gt: Date.now() },
    });

    const ongoingCourses = enrolledCourses
      .filter((course) => course.progress < 100)
      .map((course) => course.courseId);
    const ongoingCoursesDetails = await Course.find({
      _id: { $in: ongoingCourses },
    });

    const completedCourses = enrolledCourses
      .filter((course) => course.progress === 100)
      .map((course) => course.courseId);
    const completedCoursesDetails = await Course.find({
      _id: { $in: completedCourses },
    });

    res.status(200).json({
      success: true,
      availableCourses,
      ongoingCourses: ongoingCoursesDetails,
      completedCourses: completedCoursesDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error,
    });
  }
};
