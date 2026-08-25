import { Menu, Trophy, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

export default function PublicNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => {
        setMobileOpen(false);
    };

    const navItems = [
        {
            label: "Home",
            path: "/",
        },
        {
            label: "Sports",
            path: "/sports",
        },
        {
            label: "Facilities",
            path: "/facilities",
        },
        {
            label: "Reviews",
            path: "/reviews",
        },
        {
            label: "Contact",
            path: "/inquiries",
        },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <Trophy size={19} strokeWidth={2.3} />
                    </div>

                    <div>
                        <p className="text-base font-bold tracking-tight text-slate-900">
                            SportsHub
                        </p>

                        <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                            Community Sports
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Link
                        to="/login"
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                        Sign In
                    </Link>

                    <Link
                        to="/register"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Get Started
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label={
                        mobileOpen
                            ? "Close menu"
                            : "Open menu"
                    }
                    onClick={() =>
                        setMobileOpen((value) => !value)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
                >
                    {mobileOpen ? (
                        <X size={21} />
                    ) : (
                        <Menu size={21} />
                    )}
                </button>
            </div>

            {mobileOpen && (
                <div className="border-t border-slate-100 bg-white md:hidden">
                    <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    onClick={closeMobile}
                                    className={({ isActive }) =>
                                        `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                            <Link
                                to="/login"
                                onClick={closeMobile}
                                className="flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/register"
                                onClick={closeMobile}
                                className="flex h-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Get Started
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}