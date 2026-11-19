import api, { dedupeGet } from "./api";
import type { User, UserRole } from "../types/auth.types";

export const getUsers = async () => {
  return dedupeGet("GET /users", async () => {
    const response = await api.get<{ users: User[] }>("/users");
    return response.data.users;
  });
};

export const updateUserRole = async (id: string, role: UserRole) => {
  const response = await api.patch<{ user: User }>(`/users/${id}/role`, {
    role,
  });
  return response.data.user;
};