
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
});

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
      return;
    }

    if (typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        name.trim().length === 0 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Please provide valid details. Password must be at least 8 characters.",
      });
      return;
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "employee",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      secret,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

export const logout = (
  req: Request,
  res: Response
): void => {
  res.clearCookie("token", cookieOptions());

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = (
  req: Request,
  res: Response
): void => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
