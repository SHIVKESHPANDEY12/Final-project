import express from "express";
import { Department, Team } from "../models/department.model.js";

const router = express.Router();

// Create department
router.post("/createDepartment", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  try {
    // Check if the department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = new Department({ name });
    await department.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    });
  }
});

// Create team within a department
router.post("/:departmentId/createTeam", async (req, res) => {
  const { departmentId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Team name is required",
    });
  }

  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const team = new Team({ name, department: department._id });
    await team.save();

    res.status(201).json({
      success: true,
      message: "Team created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create team",
      error: error.message,
    });
  }
});

// Get all departments with their teams
router.get("/", async (req, res) => {
  try {
    // Fetch all departments
    const departments = await Department.find();

    // Fetch teams for each department
    const departmentsWithTeams = await Promise.all(
      departments.map(async (department) => {
        const teams = await Team.find({ department: department._id });
        return {
          ...department.toObject(),
          teams, // Attach the teams array to the department object
        };
      })
    );

    res.status(200).json({
      success: true,
      departments: departmentsWithTeams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get departments",
      error: error.message,
    });
  }
});

// Dummy route to insert data into DB
// router.post("/insertDummyData", async (req, res) => {
//   try {
//     // Define dummy departments and teams
//     const departmentsData = [
//       { name: "HR" },
//       { name: "Engineering" },
//       { name: "Sales" },
//       { name: "Marketing" },
//       { name: "Finance" },
//     ];

//     // Insert departments into the database
//     const insertedDepartments = await Department.insertMany(departmentsData);

//     // Define teams for each department
//     const teamsData = [
//       { name: "Recruitment", department: insertedDepartments[0]._id },
//       { name: "Payroll", department: insertedDepartments[0]._id },
//       { name: "Compliance", department: insertedDepartments[0]._id },
//       { name: "Training", department: insertedDepartments[0]._id },
//       { name: "Employee Relations", department: insertedDepartments[0]._id },
//       { name: "Development", department: insertedDepartments[1]._id },
//       { name: "QA", department: insertedDepartments[1]._id },
//       { name: "DevOps", department: insertedDepartments[1]._id },
//       { name: "Product", department: insertedDepartments[1]._id },
//       { name: "Support", department: insertedDepartments[1]._id },
//       { name: "Inside Sales", department: insertedDepartments[2]._id },
//       { name: "Outside Sales", department: insertedDepartments[2]._id },
//       { name: "Customer Success", department: insertedDepartments[2]._id },
//       { name: "Lead Generation", department: insertedDepartments[2]._id },
//       { name: "Account Management", department: insertedDepartments[2]._id },
//       { name: "Content Marketing", department: insertedDepartments[3]._id },
//       { name: "SEO", department: insertedDepartments[3]._id },
//       { name: "Social Media", department: insertedDepartments[3]._id },
//       { name: "Email Marketing", department: insertedDepartments[3]._id },
//       { name: "Product Marketing", department: insertedDepartments[3]._id },
//       { name: "Accounting", department: insertedDepartments[4]._id },
//       { name: "Auditing", department: insertedDepartments[4]._id },
//       { name: "Budgeting", department: insertedDepartments[4]._id },
//       { name: "Financial Analysis", department: insertedDepartments[4]._id },
//       { name: "Treasury", department: insertedDepartments[4]._id },
//     ];

//     // Insert teams into the database
//     await Team.insertMany(teamsData);

//     res.status(201).json({
//       success: true,
//       message: "Dummy data inserted successfully",
//       departments: insertedDepartments,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to insert dummy data",
//       error: error.message,
//     });
//   }
// });

export default router;
