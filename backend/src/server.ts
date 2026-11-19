
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";

import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.route";
import userRoutes from "./routes/user.routes";
import { initializeSocket } from "./socket";

const app = express();
const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })  
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
