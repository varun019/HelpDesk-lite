import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Dialog } from "@base-ui/react/dialog";
import { useAuth } from "../../hooks/useAuth";

type NotificationEntry = {
  id: string;
  kind: "comment" | "status";
  ticketId: string;
  title: string;
  comment?: string;
  authorName?: string;
  status?: string;
  createdAt: string;
};

type NotificationEvent = Omit<NotificationEntry, "id" | "createdAt"> & {
  createdAt?: string;
  actorId?: string;
};

const formatStatus = (status = "") => status
  .split("_")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setNotifications([]);
      setNotificationsOpen(false);
      return;
    }

    const socketUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api\/?$/, "");
    const socket = io(socketUrl, { withCredentials: true });
    const handleNotification = (notification: NotificationEvent) => {
      if (notification.actorId === user._id) return;
      setNotificationCount((count) => count + 1);
      setNotifications((items) => [{
        ...notification,
        id: `${notification.kind}-${notification.ticketId}-${notification.createdAt || Date.now()}`,
        createdAt: notification.createdAt || new Date().toISOString(),
      }, ...items].slice(0, 20));
    };

    socket.on("notification:new", handleNotification);
    return () => { socket.disconnect(); };
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b bg-white px-5 md:px-8">
      <div className="font-semibold text-slate-800">
        Support Ticket System
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={notificationCount ? `Notifications, ${notificationCount} unread` : "Notifications"}
          title={notificationCount ? `${notificationCount} unread notification${notificationCount === 1 ? "" : "s"}` : "Notifications"}
          onClick={() => {
            setNotificationsOpen((open) => !open);
            setNotificationCount(0);
          }}
          className="relative rounded-lg bg-slate-100 p-2 text-slate-600"
          aria-expanded={notificationsOpen}
          aria-haspopup="dialog"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {notificationsOpen && (
          <div role="dialog" aria-label="Notifications" className="absolute right-16 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
              {notifications.length > 0 && <span className="text-xs text-slate-500">Recent activity</span>}
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">You’re all caught up.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={`/tickets/${notification.ticketId}`}
                    onClick={() => setNotificationsOpen(false)}
                    className="block border-b px-4 py-3 last:border-b-0 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {notification.kind === "comment" ? "New comment added" : "Ticket status changed"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-700">
                      {notification.kind === "comment"
                        ? `${notification.authorName || "A team member"}: ${notification.comment || "Added a comment."}`
                        : `Status changed to ${formatStatus(notification.status)}.`}
                    </p>
                    <p className="mt-1.5 text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize text-slate-500">
            {user?.role}
          </p>
        </div>

        <Dialog.Root>
          <Dialog.Trigger
            type="button"
            title="Logout"
            aria-label="Logout"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <LogOut size={19} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/40 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-xl outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              <Dialog.Title className="text-lg font-semibold text-slate-900">Confirm logout</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-slate-600">
                Are you sure you want to log out of your account?
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <Dialog.Close
                  type="button"
                  disabled={loggingOut}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </Dialog.Close>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {loggingOut ? "Logging out..." : "Confirm logout"}
                </button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
};

export default Header;
