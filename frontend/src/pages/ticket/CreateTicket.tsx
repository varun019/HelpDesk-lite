import { useState } from "react";
import { ArrowLeft, LoaderCircle, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createTicket } from "../../services/ticket.service";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/utils/apiError";

const schema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(10, "Please provide more details"),
  priority: z.enum(["high", "medium", "low"]),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTicket() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const ticket = await createTicket(values);
      toast.success("Ticket created successfully!");
      navigate(`/tickets/${ticket._id}`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Unable to create ticket."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700">
        <ArrowLeft size={16} /> Back to tickets
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Ticket</h1>
        <p className="mt-1 text-sm text-slate-500">Describe your issue and our support team will assist you.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="ticket-title" className="mb-2 block text-sm font-medium text-slate-700">Ticket title</label>
          <input
            id="ticket-title"
            {...register("title")}
            placeholder="e.g. Unable to access my account"
            aria-invalid={Boolean(errors.title)}
            className="h-11 w-full rounded-lg border px-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600" role="alert">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="ticket-description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="ticket-description"
            {...register("description")}
            rows={6}
            placeholder="Explain the issue, steps to reproduce it and any relevant details..."
            aria-invalid={Boolean(errors.description)}
            className="w-full resize-y rounded-lg border p-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600" role="alert">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="ticket-priority" className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
          <Select
            id="ticket-priority"
            name="priority"
            value={watch("priority")}
            onValueChange={(value) => setValue("priority", value as FormValues["priority"], { shouldValidate: true, shouldDirty: true })}
            className="h-11 w-full"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <Link to="/tickets" className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
            Cancel
          </Link>
          <button
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={16} />}
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
