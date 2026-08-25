import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import {
  getAdminMember,
  logout,
} from "../services/api";

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
    label: "Member Sports",
    path: "/member-sports",
    icon: Dumbbell,
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

  const adminName =
    admin?.name || "Administrator";

  const firstLetter =
    adminName.charAt(0).toUpperCase() || "A";

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:translate-x-0 ${mobileOpen
          ? "translate-x-0"
          : "-translate-x-full"
        }`}
    >
      {/* Logo */}

      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-800 px-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <Trophy
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <div>

            <h1 className="text-lg font-bold tracking-tight text-white">
              SportsHub
            </h1>

            <p className="text-[11px] font-medium text-slate-400">
              Admin Panel
            </p>

          </div>

        </div>

        {/* Mobile close button */}

        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <X size={19} />
        </button>

      </div>

      {/* Navigation */}

      <nav className="flex-1 min-h-0 overflow-hidden px-3 py-4">

        {/* Management */}

        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Management
        </p>

        <div className="space-y-0.5">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >

                {({ isActive }) => (
                  <>

                    {/* Active indicator */}

                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={
                        isActive ? 2.3 : 2
                      }
                      className={`transition ${isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                        }`}
                    />

                    <span>
                      {item.label}
                    </span>

                  </>
                )}

              </NavLink>
            );
          })}

        </div>

        {/* System */}

        <p className="mb-3 mt-5 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          System
        </p>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isActive
              ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >

          {({ isActive }) => (
            <>

              {/* Active indicator */}

              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
              )}

              <Settings
                size={19}
                strokeWidth={
                  isActive ? 2.3 : 2
                }
                className={
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white"
                }
              />

              <span>
                Settings
              </span>

            </>
          )}

        </NavLink>

      </nav>

      {/* User section */}

      <div className="shrink-0 border-t border-slate-800 p-3">

        <NavLink
          to="/settings"
          onClick={onClose}
          className="mb-2 flex items-center gap-3 rounded-xl bg-slate-800 p-2.5 transition hover:bg-slate-700"
        >

          {/* Avatar */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {firstLetter}
          </div>

          {/* User information */}

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-white">
              {adminName}
            </p>

            <p className="truncate text-xs text-slate-400">
              Administrator
            </p>

          </div>

          <ChevronRight
            size={16}
            className="shrink-0 text-slate-400"
          />

        </NavLink>

        {/* Sign out */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >

          <LogOut size={19} />

          <span>
            Sign Out
          </span>

        </button>

      </div>

    </aside>
  );
}