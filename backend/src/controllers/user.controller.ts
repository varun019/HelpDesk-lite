import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { UserRole } from "../models/user.model";

const userRoles: UserRole[] = ["employee", "agent", "admin"];

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("_id name email role")
      .sort({ name: 1 });

    res.status(200).json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load users." });
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "User not found." });
    return;
  }

  if (req.params.id === req.user._id) {
    res.status(403).json({
      success: false,
      message: "You cannot change your own role.",
    });
    return;
  }

  const { role } = req.body ?? {};
  if (typeof role !== "string" || !userRoles.includes(role as UserRole)) {
    res.status(400).json({
      success: false,
      message: "A valid user role is required.",
    });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("_id name email role");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to update user role.",
    });
  }
};