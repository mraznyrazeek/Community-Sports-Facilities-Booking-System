import { useState } from "react";
import {
    CalendarDays,
    ChevronDown,
    LogIn,
    LogOut,
    Menu,
    Trophy,
    User,
    X,
} from "lucide-react";
import {
    Link,
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    getCurrentMember,
    isAuthenticated,
    logout,
} from "../services/api";

export default function PublicNavbar() {
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const member = getCurrentMember();
    const authenticated = isAuthenticated();

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        closeMobileMenu();

        navigate("/login", {
            replace: true,
        });
    };

    const navLinkClass = ({ isActive }) =>
        [
            "relative py-2 text-sm font-semibold transition",
            isActive
                ? "text-blue-600"
                : "text-slate-600 hover:text-blue-600",
        ].join(" ");

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* ==================================================
                    LOGO
                ================================================== */}

                <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <CalendarDays size={20} />
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-extrabold tracking-tight text-slate-900">
                            SportsHub
                        </p>

                        <p className="text-[10px] font-medium text-slate-400">
                            Community Sports
                        </p>
                    </div>
                </Link>


                {/* ==================================================
                    DESKTOP NAVIGATION
                ================================================== */}

                <nav className="hidden items-center gap-7 md:flex">

                    <NavLink
                        to="/"
                        className={navLinkClass}
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/sports"
                        className={navLinkClass}
                    >
                        Sports
                    </NavLink>

                    <NavLink
                        to="/facilities"
                        className={navLinkClass}
                    >
                        Facilities
                    </NavLink>

                    <NavLink
                        to="/inquiries"
                        className={navLinkClass}
                    >
                        Inquiries
                    </NavLink>

                </nav>


                {/* ==================================================
                    DESKTOP RIGHT SIDE
                ================================================== */}

                <div className="hidden items-center gap-3 md:flex">

                    {authenticated ? (
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <User size={16} />
                                </div>

                                <span className="max-w-[120px] truncate">
                                    {member?.firstName ||
                                        member?.name ||
                                        "My Profile"}
                                </span>

                                <ChevronDown
                                    size={15}
                                    className="text-slate-400"
                                />
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <LogIn size={16} />
                            Login
                        </Link>
                    )}

                </div>


                {/* ==================================================
                    MOBILE MENU BUTTON
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        setMobileMenuOpen((previous) => !previous)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}
                </button>

            </div>


            {/* ======================================================
                MOBILE NAVIGATION
            ====================================================== */}

            {mobileMenuOpen && (
                <div className="border-t border-slate-200 bg-white md:hidden">

                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                        <nav className="space-y-1">

                            <NavLink
                                to="/"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
                                    ].join(" ")
                                }
                            >
                                <CalendarDays size={18} />
                                Home
                            </NavLink>

                            <NavLink
                                to="/sports"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
                                    ].join(" ")
                                }
                            >
                                <Trophy size={18} />
                                Sports
                            </NavLink>

                            <NavLink
                                to="/facilities"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
                                    ].join(" ")
                                }
                            >
                                <CalendarDays size={18} />
                                Facilities
                            </NavLink>

                            <NavLink
                                to="/inquiries"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    [
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
                                    ].join(" ")
                                }
                            >
                                <LogIn size={18} />
                                Inquiries
                            </NavLink>

                        </nav>


                        {/* ==================================================
                            MOBILE ACCOUNT
                        ================================================== */}

                        <div className="mt-4 border-t border-slate-200 pt-4">

                            {authenticated ? (
                                <div className="space-y-2">

                                    <Link
                                        to="/profile"
                                        onClick={closeMobileMenu}
                                        className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <User size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {member?.firstName ||
                                                    member?.name ||
                                                    "My Profile"}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                View your profile
                                            </p>
                                        </div>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>

                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <LogIn size={17} />
                                    Login
                                </Link>
                            )}

                        </div>

                    </div>
                </div>
            )}
        </header>
    );
}