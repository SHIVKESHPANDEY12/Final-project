import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./databases/index.js";

const app = express();

const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import courseRoutes from "./routes/course.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);

// Error Handling
import { notFound, errorHandler } from "./utils/errorHandler.js";

app.use(notFound);
app.use(errorHandler);

// Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
