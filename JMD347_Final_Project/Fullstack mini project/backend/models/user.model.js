import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const validateEmail = (email) => /^[\w-\.]+@jmangroup\.com$/.test(email);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validateEmail,
        message: (props) =>
          `${props.value} is not a valid email! It should be from the 'jmangroup.com' domain.`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["admin", "employee"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export const User = mongoose.model("User", userSchema);
