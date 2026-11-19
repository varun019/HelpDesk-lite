import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.model";

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "Support Agent",
    email: "agent@test.com",
    password: "Agent@123",
    role: "agent",
  },
  {
    name: "Employee One",
    email: "employee1@test.com",
    password: "Employee@123",
    role: "employee",
  },
  {
    name: "Employee Two",
    email: "employee2@test.com",
    password: "Employee@123",
    role: "employee",
  },
] as const;

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({
        email: userData.email,
      });

      if (existingUser) {
        console.log(`Already exists: ${userData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        userData.password,
        12
      );

      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      });

      console.log(`Created: ${userData.email}`);
    }

    console.log("User seeding completed!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();