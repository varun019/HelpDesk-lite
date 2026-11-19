
import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "employee" | "agent" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["employee", "agent", "admin"],
      default: "employee",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
