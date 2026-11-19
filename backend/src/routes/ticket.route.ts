import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";
import roleMiddleware from "../middleware/role.middleware";

import {
  getTickets,
  getTicketById,
  createTicket,
  assignTicket,
  updateTicketStatus,
  addTicketComment,
  deleteTicket,
} from "../controllers/ticket.controller";

const router = Router();

// Get all tickets (employee ownership filtering in controller)
router.get("/", authMiddleware, getTickets);
router.get("/:id", authMiddleware, getTicketById);

// Create ticket (employee only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("employee"),
  createTicket
);

// Assign ticket (agent/admin)
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("agent", "admin"),
  assignTicket
);

// Update ticket status (agent/admin)
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("agent", "admin"),
  updateTicketStatus
);

// Add comment (all authenticated roles)
router.post(
  "/:id/comments",
  authMiddleware,
  addTicketComment
);

// Employees may delete their own tickets only while they are open.
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("employee"),
  deleteTicket
);

export default router;
