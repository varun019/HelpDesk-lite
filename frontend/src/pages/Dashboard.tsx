import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  CircleAlert,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { getTickets } from "../services/ticket.service";
import type { Ticket as TicketType } from "../types/ticket.types";
import TicketStatusBadge from "../components/tickets/TicketStatusBadge";
import TicketPriorityBadge from "../components/tickets/TicketPriorityBadge";
import { ErrorState } from "@/common/PageState";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Request a large enough page for dashboard statistics.
      const result = await getTickets({
        page: 1,
        limit: 100,
        search: "",
        status: "",
        priority: "",
      });

      setTickets(Array.isArray(result?.tickets) ? result.tickets : []);
      setTotal(typeof result?.total === "number" ? result.total : 0);
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Total Tickets",
      value: total,
      icon: Ticket,
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Open Tickets",
      value: tickets.filter((t) => t.status === "open").length,
      icon: CircleAlert,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "In Progress",
      value: tickets.filter((t) => t.status === "in_progress").length,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => t.status === "resolved").length,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-700",
    },
  ];

  const recentTicketColumns: ColumnDef<TicketType, any>[] = [
    { accessorKey: "title", header: "Subject", cell: ({ row }) => <Link to={`/tickets/${row.original._id}`} className="font-medium text-slate-700 hover:text-teal-700">{row.original.title}</Link> },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} /> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <TicketStatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-slate-500">{new Date(row.original.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's an overview of your support tickets.
          </p>
        </div>

        {user?.role === "employee" && (
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus size={17} /> Create Ticket
          </Link>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadDashboard} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? Array.from({ length: 4 }, (_, index) => (
              <div key={`stat-skeleton-${index}`} className="rounded-xl border bg-white p-5 shadow-sm" aria-hidden="true">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="size-10 animate-pulse rounded-lg bg-slate-100" />
                </div>
                <div className="mt-4 h-9 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            )) : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <div className={`rounded-lg p-2.5 ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold text-slate-900">Recent Tickets</h2>
                <p className="mt-1 text-xs text-slate-500">Latest tickets in your workspace</p>
              </div>
              <Link to="/tickets" className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
                View all <ArrowUpRight size={16} />
              </Link>
            </div>

            <DataTable columns={recentTicketColumns} data={tickets.slice(0, 5)} loading={loading} emptyMessage="No tickets yet. New tickets will appear here." />
          </section>
        </>
      )}
    </div>
  );
}
