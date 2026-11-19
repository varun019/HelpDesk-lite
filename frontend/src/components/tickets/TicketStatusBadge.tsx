import type { TicketStatus } from "../../types/ticket.types";

const styles: Record<TicketStatus, string> = {
  open: "bg-blue-50 text-blue-600",
  in_progress: "bg-amber-50 text-amber-600",
  resolved: "bg-green-50 text-green-600",
  closed: "bg-slate-100 text-slate-600",
};

const labels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const TicketStatusBadge = ({ status }: { status: TicketStatus }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
    {labels[status]}
  </span>
);

export default TicketStatusBadge;