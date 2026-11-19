import axios from "axios";

const inFlightGetRequests = new Map<string, Promise<unknown>>();

export const dedupeGet = <T>(key: string, request: () => Promise<T>) => {
  const existingRequest = inFlightGetRequests.get(key);
  if (existingRequest) return existingRequest as Promise<T>;

  const pendingRequest = request().finally(() => {
    if (inFlightGetRequests.get(key) === pendingRequest) {
      inFlightGetRequests.delete(key);
    }
  });

  inFlightGetRequests.set(key, pendingRequest);
  return pendingRequest;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Expired or missing session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthRequest) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;