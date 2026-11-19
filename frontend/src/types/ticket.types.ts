export type TicketPriority = "high" | "medium" | "low";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export interface TicketComment {
  _id?: string;
  text: string;
  author: User;
  createdAt: string;
}

import type { User } from "./auth.types";

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: User;
  assignedTo: User | null;
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketFilters {
  page: number;
  limit: number;
  search: string;
  status: string;
  priority: string;
}

export interface PaginatedTickets {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}