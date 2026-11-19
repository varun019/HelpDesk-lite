import api, { dedupeGet } from "./api";
import type {
  Ticket,
  TicketFilters,
  PaginatedTickets,
} from "../types/ticket.types";

export const getTickets = async (filters: TicketFilters) => {
  return dedupeGet(`GET /tickets ${JSON.stringify(filters)}`, async () => {
    const response = await api.get<PaginatedTickets>("/tickets", {
      params: filters,
    });
    return response.data;
  });
};

export const getTicketById = async (ticketId: string) => {
  return dedupeGet(`GET /tickets/${ticketId}`, async () => {
    const response = await api.get<{ ticket: Ticket }>(`/tickets/${ticketId}`);
    return response.data.ticket;
  });
};

export const createTicket = async (data: {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}) => {
  const response = await api.post<{ ticket: Ticket }>("/tickets", data);
  return response.data.ticket;
};

export const assignTicketToMe = async (ticketId: string) => {
  const response = await api.patch<{ ticket: Ticket }>(
    `/tickets/${ticketId}/assign`
  );
  return response.data.ticket;
};

export const updateTicketStatus = async (
  ticketId: string,
  status: Ticket["status"]
) => {
  const response = await api.patch<{ ticket: Ticket }>(
    `/tickets/${ticketId}/status`,
    { status }
  );
  return response.data.ticket;
};

export const addTicketComment = async (
  ticketId: string,
  text: string
) => {
  const response = await api.post<{ ticket: Ticket }>(
    `/tickets/${ticketId}/comments`,
    { text }
  );
  return response.data.ticket;
};