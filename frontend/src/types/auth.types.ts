export type UserRole = "employee" | "agent" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}