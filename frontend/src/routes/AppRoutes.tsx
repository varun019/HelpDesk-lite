import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Tickets from "@/pages/ticket/Tickets";
import CreateTicket from "@/pages/ticket/CreateTicket";
import TicketDetails from "@/pages/ticket/TicketDetails";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
            <Route path="/tickets/new" element={<CreateTicket />} />
          </Route>
          <Route path="/tickets/:id" element={<TicketDetails />} />

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;