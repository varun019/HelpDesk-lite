import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

type Props<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  minWidth?: string;
};

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results found.",
  loading,
  error,
  onRetry,
  minWidth = "min-w-[650px]",
}: Props<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const columnCount = table.getAllLeafColumns().length;

  return (
    <div className="overflow-x-auto">
      <table
        aria-busy={loading}
        className={`w-full ${minWidth} text-left text-sm`}
      >
        <thead className="bg-slate-50 text-xs text-slate-500">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="px-5 py-4 font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y">
          {loading ? (
            Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <td key={`skeleton-${rowIndex}-${columnIndex}`} className="px-5 py-4">
                    <div className={`h-4 animate-pulse rounded bg-slate-200 ${columnIndex === 0 ? "w-3/4" : "w-1/2"}`} />
                  </td>
                ))}
              </tr>
            ))
          ) : error || data.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className={`p-10 text-center ${error ? "text-red-600" : "text-slate-500"}`}
              >
                {error ? (
                  <>
                    {error}
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="ml-2 underline"
                      >
                        Retry
                      </button>
                    )}
                  </>
                ) : (
                  emptyMessage
                )}
              </td>
            </tr>
          ) : table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-5 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
