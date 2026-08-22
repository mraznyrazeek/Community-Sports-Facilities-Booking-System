import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    CalendarDays,
    Trophy,
    Building2,
    Star,
    MessageSquare,
    User,
    LogOut,
} from "lucide-react";

import { logout } from "../services/api";

const menuItems = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Bookings",
        path: "/bookings",
        icon: CalendarDays,
    },
    {
        name: "Sports",
        path: "/sports",
        icon: Trophy,
    },
    {
        name: "Facilities",
        path: "/facilities",
        icon: Building2,
    },
    {
        name: "My Sports",
        path: "/my-sports",
        icon: Trophy,
    },
    {
        name: "Reviews",
        path: "/reviews",
        icon: Star,
    },
    {
        name: "Inquiries",
        path: "/inquiries",
        icon: MessageSquare,
    },
    {
        name: "Profile",
        path: "/profile",
        icon: User,
    },
];

export default function Sidebar() {
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-gray-100 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Trophy size={21} />
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            SportsHub
                        </h1>

                        <p className="text-xs text-gray-400">
                            Community Sports
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            <Icon size={19} />

                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 p-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={19} />

                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}