import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-slate-500">
      <LoaderCircle className="animate-spin text-teal-600" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There are no records to display.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center">
      <div className="rounded-full bg-slate-100 p-4">
        <Inbox className="text-slate-400" size={25} />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="text-red-500" size={28} />
      <p className="text-sm text-red-600">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Try again
      </button>
    </div>
  );
}