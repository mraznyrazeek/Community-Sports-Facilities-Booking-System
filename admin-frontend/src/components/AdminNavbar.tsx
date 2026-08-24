import {
  Bell,
  ChevronDown,
  Search,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { getAdminMember } from "../services/api";

export default function AdminNavbar() {
  const admin = getAdminMember();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const adminName = admin?.name || "Administrator";

  const firstLetter =
    adminName.charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="ml-14 flex min-w-0 flex-1 items-center lg:ml-0">
        <div className="relative w-full max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder="Search anything..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2 sm:ml-6 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              setNotificationsOpen((value) => !value)
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Recent system activity
                  </p>
                </div>

                <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                  New
                </span>
              </div>

              <div className="px-4 py-5">
                <p className="text-sm text-slate-500">
                  You have notifications available in the
                  administration system.
                </p>
              </div>

              <div className="border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    setNotificationsOpen(false)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </header>
  );
}