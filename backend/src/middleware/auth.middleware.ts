
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

interface JwtPayload {
  userId: string;
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

export default authMiddleware;
