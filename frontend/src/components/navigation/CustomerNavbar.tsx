import {
    CalendarDays,
    ChevronDown,
    LogOut,
    Menu,
    User,
    X,
} from "lucide-react";
import {
    Link,
    NavLink,
    useNavigate,
} from "react-router-dom";
import { useState } from "react";

import {
    getCurrentMember,
    logout,
} from "../../services/api";

export default function CustomerNavbar() {
    const navigate = useNavigate();
    const member = getCurrentMember();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();

        setMobileMenuOpen(false);
        setProfileMenuOpen(false);

        navigate("/login", {
            replace: true,
        });
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const getInitials = () => {
        if (member?.firstName && member?.lastName) {
            return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
        }

        if (member?.firstName) {
            return member.firstName.charAt(0).toUpperCase();
        }

        if (member?.name) {
            return member.name.charAt(0).toUpperCase();
        }

        return "M";
    };

    const getMemberName = () => {
        if (member?.firstName && member?.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }

        return member?.firstName || member?.name || "Member";
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

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `relative py-2 text-sm font-medium transition-colors ${
            isActive
                ? "text-blue-600"
                : "text-slate-600 hover:text-blue-600"
        }`;

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">

            {/* =====================================================
                DESKTOP / MAIN NAVBAR
               ===================================================== */}

            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="group flex shrink-0 items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-700">
                        <CalendarDays size={20} strokeWidth={2.2} />
                    </div>

                    <div className="hidden xs:block sm:block">
                        <p className="text-[15px] font-bold leading-tight tracking-tight text-slate-900">
                            SportsHub
                        </p>

                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Community Sports
                        </p>
                    </div>
                </Link>


                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-7 md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={navLinkClasses}
                        >
                            {({ isActive }) => (
                                <>
                                    {item.label}

                                    {isActive && (
                                        <span className="absolute -bottom-[23px] left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>


                {/* Desktop Member Area */}
                <div className="relative hidden items-center gap-2 md:flex">

                    {/* Profile Button */}
                    <button
                        type="button"
                        onClick={() =>
                            setProfileMenuOpen((previous) => !previous)
                        }
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {getInitials()}
                        </div>

                        <div className="max-w-[120px] text-left">
                            <p className="truncate text-sm font-semibold text-slate-800">
                                {getMemberName()}
                            </p>

                            <p className="text-[11px] text-slate-400">
                                Member
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className={`ml-1 text-slate-400 transition-transform ${
                                profileMenuOpen
                                    ? "rotate-180"
                                    : ""
                            }`}
                        />
                    </button>


                    {/* Profile Dropdown */}
                    {profileMenuOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Close profile menu"
                                onClick={() =>
                                    setProfileMenuOpen(false)
                                }
                                className="fixed inset-0 z-40 cursor-default"
                            />

                            <div className="absolute right-0 top-[58px] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">

                                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {getMemberName()}
                                    </p>

                                    {member?.email && (
                                        <p className="mt-1 truncate text-xs text-slate-500">
                                            {member.email}
                                        </p>
                                    )}
                                </div>

                                <div className="p-2">

                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setProfileMenuOpen(false)
                                        }
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                                    >
                                        <User
                                            size={17}
                                            className="text-slate-400"
                                        />

                                        My Profile
                                    </Link>

                                    <Link
                                        to="/profile/bookings"
                                        onClick={() =>
                                            setProfileMenuOpen(false)
                                        }
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                                    >
                                        <CalendarDays
                                            size={17}
                                            className="text-slate-400"
                                        />

                                        My Bookings
                                    </Link>

                                </div>

                                <div className="border-t border-slate-100 p-2">

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <LogOut size={17} />

                                        Logout
                                    </button>

                                </div>

                            </div>
                        </>
                    )}

                </div>


                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() =>
                        setMobileMenuOpen((previous) => !previous)
                    }
                    aria-label={
                        mobileMenuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600 md:hidden"
                >
                    {mobileMenuOpen ? (
                        <X size={21} />
                    ) : (
                        <Menu size={21} />
                    )}
                </button>

            </div>


            {/* =====================================================
                MOBILE NAVIGATION
               ===================================================== */}

            {mobileMenuOpen && (
                <div className="border-t border-slate-100 bg-white md:hidden">

                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                        {/* Mobile Member Card */}
                        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                {getInitials()}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                    {getMemberName()}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                    {member?.email || "Community Member"}
                                </p>
                            </div>

                        </div>


                        {/* Mobile Links */}
                        <nav className="space-y-1">

                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    className={({ isActive }) =>
                                        `block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}


                            <div className="my-3 border-t border-slate-100" />


                            <NavLink
                                to="/profile"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                    }`
                                }
                            >
                                <User size={18} />

                                My Profile
                            </NavLink>

                            <NavLink
                                to="/profile/bookings"
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                    }`
                                }
                            >
                                <CalendarDays size={18} />

                                My Bookings
                            </NavLink>


                            {/* Mobile Logout */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                            >
                                <LogOut size={18} />

                                Logout
                            </button>

                        </nav>

                    </div>

                </div>
            )}

        </header>
    );
}