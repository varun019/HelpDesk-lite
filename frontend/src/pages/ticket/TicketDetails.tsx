import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, UserRoundCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import type { Ticket, TicketStatus } from "@/types/ticket.types";
import { addTicketComment, assignTicketToMe, getTicketById, updateTicketStatus } from "@/services/ticket.service";
import TicketPriorityBadge from "@/components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "@/components/tickets/TicketStatusBadge";
import { ErrorState, LoadingState } from "@/common/PageState";
import { Select } from "@/components/ui/select";

export default function TicketDetails() {
  const { id = "" } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canManage = user?.role === "agent" || user?.role === "admin";

  const loadTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setTicket(await getTicketById(id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load this ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    if (!id) return;
    const socketUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api\/?$/, "");
    const socket = io(socketUrl, { withCredentials: true });

    const joinTicketRoom = () => socket.emit("ticket:join", id);
    socket.on("connect", joinTicketRoom);
    socket.on("ticket:status-updated", (update: { ticketId: string; status: TicketStatus; updatedAt: string }) => {
      if (update.ticketId !== id) return;
      setTicket((current) => current ? { ...current, status: update.status, updatedAt: update.updatedAt } : current);
    });
    socket.on("ticket:comment-added", (update: { ticketId: string; comment: Ticket["comments"][number] }) => {
      if (update.ticketId !== id) return;
      setTicket((current) => {
        if (!current || current.comments.some((item) => item._id === update.comment._id)) return current;
        return { ...current, comments: [...current.comments, update.comment] };
      });
    });

    if (socket.connected) joinTicketRoom();
    return () => { socket.disconnect(); };
  }, [id]);

  const handleAssign = async () => {
    try {
      await assignTicketToMe(id);
      toast.success("Ticket assigned to you.");
      await loadTicket();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Assignment failed.");
    }
  };

  const handleStatus = async (status: TicketStatus) => {
    try {
      const updatedTicket = await updateTicketStatus(id, status);
      setTicket(updatedTicket);
      toast.success("Ticket status updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const updatedTicket = await addTicketComment(id, comment.trim());
      setTicket(updatedTicket);
      setComment("");
      toast.success("Comment added.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Unable to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading ticket..." />;
  if (error || !ticket) {
    return <ErrorState message={error || "Ticket not found."} onRetry={loadTicket} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700">
        <ArrowLeft size={16} /> Back to tickets
      </Link>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ticket #{ticket._id.slice(-6)}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{ticket.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Created by {ticket.createdBy?.name || "Unknown"} ·{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="mt-6 border-t pt-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.description}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <div className="text-sm text-slate-600">
            Assigned to: <strong>{ticket.assignedTo?.name || "Unassigned"}</strong>
          </div>

          {canManage && (
            <div className="flex flex-wrap gap-2">
              {!ticket.assignedTo && (
                <button onClick={handleAssign} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
                  <UserRoundCheck size={16} /> Assign to me
                </button>
              )}

              <Select
                value={ticket.status}
                onValueChange={(value) => handleStatus(value as TicketStatus)}
                className="h-10"
                options={[{ value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }]}
              />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Conversation ({ticket.comments?.length || 0})</h2>

        <div className="mt-5 space-y-4">
          {ticket.comments?.length ? ticket.comments.map((item, index) => (
            <div key={item._id || index} className="rounded-lg bg-slate-50 p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{item.author?.name || "User"}</p>
                <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          )) : (
            <p className="py-6 text-center text-sm text-slate-400">No comments yet.</p>
          )}
        </div>

        <form onSubmit={handleComment} className="mt-6 border-t pt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Add a comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Write your message..."
            className="w-full rounded-lg border p-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <div className="mt-3 flex justify-end">
            <button
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
              Send comment
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
