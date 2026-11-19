import type { TicketPriority } from "../../types/ticket.types";

const styles: Record<TicketPriority, string> = {
  high: "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-600",
  low: "bg-green-100 text-green-600",
};

const TicketPriorityBadge = ({
  priority,
}: {
  priority: TicketPriority;
}) => (
  <span className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${styles[priority]}`}>
    {priority}
  </span>
);

export default TicketPriorityBadge;