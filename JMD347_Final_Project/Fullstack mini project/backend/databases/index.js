import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Database connected successfully\nHost : ${db.connection.host}`
    );
  } catch (error) {
    console.log(`Database connection failed : `, error);
    process.exit(1);
  }
};
