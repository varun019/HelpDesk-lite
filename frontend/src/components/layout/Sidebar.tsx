import { NavLink, useLocation } from "react-router-dom";
import {
  Ticket,
  LayoutDashboard,
  Users,
  PlusCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["employee", "agent", "admin"],
    },
    {
      label: "Tickets",
      path: "/tickets",
      icon: Ticket,
      roles: ["employee", "agent", "admin"],
    },
    {
      label: "Create Ticket",
      path: "/tickets/new",
      icon: PlusCircle,
      roles: ["employee"],
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
      roles: ["admin"],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-slate-50 md:block">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 text-xl font-bold text-teal-600">
          <Ticket size={25} />
          SupportDesk
        </div>
      </div>

      <nav className="space-y-2 p-4">
        {links
          .filter((link) =>
            link.roles.includes(user?.role || "")
          )
          .map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/tickets/new"}
                className={({ isActive }) => {
                  const active = link.path === "/tickets"
                    ? isActive && pathname !== "/tickets/new"
                    : isActive;
                  return `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-teal-100 text-teal-700"
                      : "text-slate-600 hover:bg-slate-200"
                  }`;
                }}
              >
                <Icon size={19} />
                {link.label}
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
