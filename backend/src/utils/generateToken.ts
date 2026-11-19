
import jwt, { SignOptions } from "jsonwebtoken";

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"]
    }
  );
};

export default generateToken;
