import api, { dedupeGet } from "./api";
import type { AuthResponse, User } from "../types/auth.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data.user;
};

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data.user;
};

export const getCurrentUser = async () => {
  return dedupeGet("GET /auth/me", async () => {
    const response = await api.get<{ success: boolean; user: User }>(
      "/auth/me"
    );
    return response.data.user;
  });
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};