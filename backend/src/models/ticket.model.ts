
import mongoose, { Document, Schema, Types } from "mongoose";

export type TicketPriority = "high" | "medium" | "low";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export interface ITicketComment {
  text: string;
  author: Types.ObjectId;
  createdAt: Date;
}

export interface ITicket extends Document {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  comments: ITicketComment[];
}

const commentSchema = new Schema<ITicketComment>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
