import { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import TicketPriorityBadge from "@/components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "@/components/tickets/TicketStatusBadge";
import type { Ticket, TicketFilters } from "@/types/ticket.types";
import { getTickets } from "@/services/ticket.service";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    priority: "",
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTickets(filters);

      setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
      setTotalPages(
        typeof data?.totalPages === "number" && data.totalPages > 0
          ? data.totalPages
          : 1
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Unable to load tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (
    key: keyof TicketFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
  };

  const columns: ColumnDef<Ticket, any>[] = [
    { accessorKey: "title", header: "Subject", cell: ({ row }) => <Link to={`/tickets/${row.original._id}`} className="font-medium text-slate-700 hover:text-teal-700">{row.original.title}</Link> },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} /> },
    { id: "assignee", header: "Assignee", cell: ({ row }) => <span className="text-slate-600">{row.original.assignedTo?.name || "-"}</span> },
    { accessorKey: "createdAt", header: "Created Date", cell: ({ row }) => <span className="text-slate-600">{new Date(row.original.createdAt).toLocaleDateString()}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <TicketStatusBadge status={row.original.status} /> },
    { id: "actions", header: "Actions", cell: ({ row }) => <Link to={`/tickets/${row.original._id}`} className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-100">Manage</Link> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Ticket View
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track support tickets
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />

          <input
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search ticket by title..."
            className="h-11 w-full rounded-lg border bg-white pl-10 pr-4 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter("status", value)}
          className="h-11"
          options={[{ value: "", label: "All Statuses" }, { value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }]}
        />

        <Select
          value={filters.priority}
          onValueChange={(value) => updateFilter("priority", value)}
          className="h-11"
          options={[{ value: "", label: "All Priorities" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]}
        />

        <button
          onClick={() =>
            setFilters({
              page: 1,
              limit: 10,
              search: "",
              status: "",
              priority: "",
            })
          }
          className="flex h-11 items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Reset
        </button>
      </div>

      {/* Ticket table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <DataTable columns={columns} data={tickets} loading={loading} error={error} onRetry={fetchTickets} emptyMessage="No tickets found. Try changing your filters." minWidth="min-w-[850px]" />

        {/* Pagination */}
        {!loading && !error && tickets.length > 0 && (
          <div className="flex items-center justify-between border-t p-4">
            <span className="text-xs text-slate-500">
              Page {filters.page} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => updateFilter("page", filters.page - 1)}
                className="rounded-md border px-3 py-2 text-xs disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={filters.page >= totalPages}
                onClick={() => updateFilter("page", filters.page + 1)}
                className="rounded-md border px-3 py-2 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
