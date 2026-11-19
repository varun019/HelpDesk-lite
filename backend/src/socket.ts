import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.model";
import Ticket from "./models/ticket.model";

type SocketUser = { _id: string; role: string };
let io: Server | undefined;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.headers.cookie
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("token="))
        ?.slice("token=".length);
      const secret = process.env.JWT_SECRET;
      if (!token || !secret) return next(new Error("Authentication required"));

      const decoded = jwt.verify(decodeURIComponent(token), secret) as { userId: string };
      const user = await User.findById(decoded.userId).select("_id role");
      if (!user) return next(new Error("Authentication required"));

      socket.data.user = { _id: user._id.toString(), role: user.role } satisfies SocketUser;
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;
    socket.join(`user:${user._id}`);
    if (user.role === "admin") socket.join("role:admin");

    socket.on("ticket:join", async (ticketId: string) => {
      if (typeof ticketId !== "string") return;
      const filter: Record<string, unknown> = { _id: ticketId };
      if (user.role === "employee") filter.createdBy = user._id;
      const ticket = await Ticket.exists(filter).catch(() => null);
      if (ticket) socket.join(`ticket:${ticketId}`);
    });
  });

  return io;
};

export const getSocketServer = () => io;
