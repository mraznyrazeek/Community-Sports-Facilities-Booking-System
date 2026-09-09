import {
    ArrowRight,
    Menu,
    Trophy,
    X,
} from "lucide-react";

import {
    Link,
    NavLink,
} from "react-router-dom";

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
            label: "Inquiries",
            path: "/inquiries",
        },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">

            {/* =====================================================
                MAIN NAVBAR
            ===================================================== */}

            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* =================================================
                    LOGO
                ================================================= */}

                <Link
                    to="/"
                    onClick={closeMobile}
                    className="group flex shrink-0 items-center gap-3"
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-blue-500 group-hover:shadow-md group-hover:shadow-blue-600/25">
                        <Trophy
                            size={20}
                            strokeWidth={2.2}
                        />
                    </div>

                    <div>
                        <p className="text-[16px] font-bold leading-tight tracking-tight text-slate-950">
                            SportsHub
                        </p>

                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Community Sports
                        </p>
                    </div>

                </Link>


                {/* =================================================
                    DESKTOP NAVIGATION
                ================================================= */}

                <nav className="hidden items-center gap-1 md:flex">

                    {navItems.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>

                    ))}

                </nav>


                {/* =================================================
                    PUBLIC ACTIONS
                ================================================= */}

                <div className="hidden items-center gap-2 md:flex">

                    <Link
                        to="/login"
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                        Sign In
                    </Link>

                    <Link
                        to="/register"
                        className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition duration-200 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/25"
                    >
                        Get Started

                        <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                    </Link>

                </div>


                {/* =================================================
                    MOBILE MENU
                ================================================= */}

                <button
                    type="button"
                    aria-label={
                        mobileOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={mobileOpen}
                    onClick={() =>
                        setMobileOpen((value) => !value)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 md:hidden"
                >

                    {mobileOpen ? (
                        <X size={21} />
                    ) : (
                        <Menu size={21} />
                    )}

                </button>

            </div>


            {/* =====================================================
                MOBILE NAVIGATION
            ===================================================== */}

            {mobileOpen && (

                <div className="border-t border-slate-100 bg-white md:hidden">

                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                        <nav className="space-y-1">

                            {navItems.map((item) => (

                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/"}
                                    onClick={closeMobile}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <span>
                                                {item.label}
                                            </span>

                                            {isActive && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                            )}
                                        </>
                                    )}
                                </NavLink>

                            ))}

                        </nav>


                        <div className="my-4 border-t border-slate-100" />


                        <div className="grid grid-cols-2 gap-2">

                            <Link
                                to="/login"
                                onClick={closeMobile}
                                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/register"
                                onClick={closeMobile}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                Get Started

                                <ArrowRight size={15} />
                            </Link>

                        </div>


                        <p className="mt-4 text-center text-xs text-slate-400">
                            Already a member? Sign in to manage your bookings.
                        </p>

                    </div>

                </div>

            )}

        </header>
    );
}