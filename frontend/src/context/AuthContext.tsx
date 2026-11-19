import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/auth.types";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/auth.service";

import type {
  LoginPayload,
  RegisterPayload,
} from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshUser();
      setLoading(false);
    };

    initializeAuth();
  }, [refreshUser]);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized
      );
    };
  }, []);

  const login = async (data: LoginPayload) => {
    const loggedInUser = await loginUser(data);
    setUser(loggedInUser);
  };

  const register = async (data: RegisterPayload) => {
    const registeredUser = await registerUser(data);
    setUser(registeredUser);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};