import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getAdminMember, logout } from "../services/api";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Sports",
    path: "/sports",
    icon: Trophy,
  },
  {
    label: "Facilities",
    path: "/facilities",
    icon: Building2,
  },
  {
    label: "Bookings",
    path: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Members",
    path: "/members",
    icon: Users,
  },
  {
    label: "Reviews",
    path: "/reviews",
    icon: Star,
  },
  {
    label: "Inquiries",
    path: "/inquiries",
    icon: MessageSquare,
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
}: AdminSidebarProps) {
  const admin = getAdminMember();

  const adminName = admin?.name || "Administrator";

  const firstLetter =
    adminName.charAt(0).toUpperCase() || "A";

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <Trophy size={22} strokeWidth={2.2} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              SportsHub
            </h1>

            <p className="text-[11px] font-medium text-slate-400">
              Admin Panel
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <X size={19} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Management
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={`transition ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <p className="mb-3 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          System
        </p>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
              )}

              <Settings
                size={19}
                className={
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500"
                }
              />

              <span>Settings</span>
            </>
          )}
        </NavLink>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "mailto:support@example.com";
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <CircleHelp
            size={19}
            className="text-slate-500"
          />

          <span>Help & Support</span>
        </button>
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-4">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
            {firstLetter}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {adminName}
            </p>

            <p className="truncate text-xs text-slate-500">
              Administrator
            </p>
          </div>

          <ChevronRight
            size={16}
            className="shrink-0 text-slate-400"
          />
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />

          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}