import { Request, Response } from "express";
import mongoose from "mongoose";
import Ticket from "../models/ticket.model";
import { getSocketServer } from "../socket";

export const getTickets = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = String(req.query.search ?? "").trim();
    const filter: Record<string, unknown> = {};

    if (req.user?.role === "employee") {
      filter.createdBy = req.user._id;
    }

    if (search) {
      filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }

    if (typeof req.query.status === "string" && req.query.status) {
      filter.status = req.query.status;
    }

    if (typeof req.query.priority === "string" && req.query.priority) {
      filter.priority = req.query.priority;
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .populate("comments.author", "name email"),
      Ticket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to fetch tickets.",
    });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "Ticket not found." });
    return;
  }

  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.role === "employee") {
      filter.createdBy = req.user._id;
    }

    const ticket = await Ticket.findOne(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found." });
      return;
    }

    res.status(200).json({ success: true, ticket });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to fetch ticket.",
    });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  const { title, description, priority = "medium" } = req.body ?? {};

  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  if (
    typeof title !== "string" ||
    title.trim().length < 5 ||
    title.trim().length > 120 ||
    typeof description !== "string" ||
    description.trim().length === 0 ||
    !["high", "medium", "low"].includes(priority)
  ) {
    res.status(400).json({
      success: false,
      message: "A valid title, description, and priority are required.",
    });
    return;
  }

  try {
    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      priority,
      createdBy: req.user._id,
    });

    await ticket.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to create ticket.",
    });
  }
};

export const assignTicket = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "Ticket not found." });
    return;
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.user._id },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to assign ticket.",
    });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  const { status } = req.body ?? {};
  const validStatuses = ["open", "in_progress", "resolved", "closed"];

  if (!validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: "A valid ticket status is required.",
    });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "Ticket not found." });
    return;
  }

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.author", "name email");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found." });
      return;
    }

    getSocketServer()?.to(`ticket:${ticket._id}`).emit("ticket:status-updated", {
      ticketId: ticket._id.toString(),
      status: ticket.status,
      updatedAt: ticket.get("updatedAt"),
    });

    const creator = ticket.createdBy as unknown as { _id?: mongoose.Types.ObjectId };
    const employeeId = creator?._id?.toString() ?? ticket.createdBy.toString();
    getSocketServer()?.to(`user:${employeeId}`).emit("notification:new", {
      kind: "status",
      ticketId: ticket._id.toString(),
      title: ticket.title,
      status: ticket.status,
      createdAt: ticket.get("updatedAt"),
      actorId: req.user?._id,
    });

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to update ticket status.",
    });
  }
};

export const addTicketComment = async (req: Request, res: Response) => {
  const { text } = req.body ?? {};

  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ success: false, message: "Comment text is required." });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "Ticket not found." });
    return;
  }

  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user.role === "employee") {
      filter.createdBy = req.user._id;
    }

    const ticket = await Ticket.findOne(filter);
    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found." });
      return;
    }

    ticket.comments.push({
      text: text.trim(),
      author: new mongoose.Types.ObjectId(req.user._id),
      createdAt: new Date(),
    });
    await ticket.save();
    await ticket.populate("comments.author", "name email");

    const addedComment = ticket.comments[ticket.comments.length - 1];
    getSocketServer()?.to(`ticket:${ticket._id}`).emit("ticket:comment-added", {
      ticketId: ticket._id.toString(),
      comment: addedComment,
    });
    const commentAuthor = addedComment.author as unknown as { name?: string };
    getSocketServer()?.to("role:admin").emit("notification:new", {
      kind: "comment",
      ticketId: ticket._id.toString(),
      title: ticket.title,
      comment: addedComment.text,
      authorName: commentAuthor?.name,
      createdAt: addedComment.createdAt,
      actorId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      ticket,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to add comment.",
    });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "employee") {
    res.status(403).json({ success: false, message: "Only employees can delete tickets." });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "Ticket not found." });
    return;
  }

  try {
    const ticket = await Ticket.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
      status: "open",
    });

    if (!ticket) {
      const ownedTicket = await Ticket.findOne({ _id: req.params.id, createdBy: req.user._id }).select("status");
      if (!ownedTicket) {
        res.status(404).json({ success: false, message: "Ticket not found." });
        return;
      }

      res.status(409).json({ success: false, message: "Only open tickets can be deleted." });
      return;
    }

    getSocketServer()?.to(`ticket:${ticket._id}`).emit("ticket:deleted", { ticketId: ticket._id.toString() });
    res.status(200).json({ success: true, message: "Ticket deleted successfully." });
  } catch {
    res.status(500).json({ success: false, message: "Unable to delete ticket." });
  }
};
