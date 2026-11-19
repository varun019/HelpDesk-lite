import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

import type { User, UserRole } from "../types/auth.types";
import { useAuth } from "../hooks/useAuth";
import { getUsers, updateUserRole } from "../services/user.service";
import { getApiErrorMessage } from "@/utils/apiError";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export default function Users() {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?._id;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers.filter((item) => item._id !== currentUserId));
      setError("");
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const retryUsers = () => {
    setLoading(true);
    setError("");
    void loadUsers();
  };

  const changeRole = async (id: string, role: UserRole) => {
    if (id === currentUserId || updatingRole) return;

    try {
      setUpdatingRole(true);
      const updatedUser = await updateUserRole(id, role);
      setUsers((previous) =>
        previous.map((item) => item._id === id ? updatedUser : item)
      );
      toast.success("User role updated.");
    } catch (requestError: unknown) {
      toast.error(getApiErrorMessage(requestError, "Unable to update role."));
    } finally {
      setUpdatingRole(false);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <span className="font-medium text-slate-800">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-slate-500">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-600">
          {row.original.role}
        </span>
      ),
    },
    {
      id: "access",
      header: "Access",
      cell: ({ row }) => (
        <Select
          value={row.original.role}
          disabled={updatingRole}
          onValueChange={(value) => changeRole(row.original._id, value as UserRole)}
          className="h-9 text-xs"
          options={[
            { value: "employee", label: "Employee" },
            { value: "agent", label: "Agent" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-teal-700">
          <ShieldCheck size={20} />
          <span className="text-sm font-medium">Administration</span> 
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage team members and their access permissions.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold text-slate-800">Team Members</h2>
            <p className="mt-1 text-xs text-slate-500">Manage employee and agent roles</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <UsersIcon size={17} /> {users.length} {users.length === 1 ? "user" : "users"}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found."
          minWidth="min-w-[650px]"
          loading={loading}
          error={error}
          onRetry={retryUsers}
        />
      </section>
    </div>
  );
}
