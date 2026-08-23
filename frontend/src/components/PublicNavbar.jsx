import {
    CalendarDays,
    ChevronDown,
    LogIn,
    Menu,
    Trophy,
    UserPlus,
    X,
} from "lucide-react";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    getCurrentMember,
    isAuthenticated,
    logout,
} from "../services/api";

export default function PublicNavbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [mobileMenu, setMobileMenu] = useState(false);
    const [profileMenu, setProfileMenu] = useState(false);

    const authenticated = isAuthenticated();
    const member = getCurrentMember();

    const navigation = [
        {
            name: "Home",
            path: "/",
        },
        {
            name: "Sports",
            path: "/sports",
        },
        {
            name: "Facilities",
            path: "/facilities",
        },
        {
            name: "Reviews",
            path: "/reviews",
        },
        {
            name: "Contact",
            path: "/inquiries",
        },
    ];

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();

        setProfileMenu(false);
        setMobileMenu(false);

        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="flex h-20 items-center justify-between">

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                        onClick={() => setMobileMenu(false)}
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                            <Trophy size={23} />
                        </div>

                        <div className="hidden sm:block">
                            <div className="text-lg font-bold text-gray-900">
                                SportsHub
                            </div>

                            <div className="text-xs text-gray-500">
                                Community Sports
                            </div>
                        </div>

                    </Link>


                    {/* DESKTOP NAVIGATION */}

                    <nav className="hidden items-center gap-1 lg:flex">

                        {navigation.map((item) => (

                            <Link
                                key={item.path}
                                to={item.path}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    isActive(item.path)
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                                {item.name}
                            </Link>

                        ))}

                    </nav>


                    {/* RIGHT SIDE */}

                    <div className="hidden items-center gap-3 lg:flex">

                        {!authenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    <LogIn size={17} />
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <UserPlus size={17} />
                                    Become a Member
                                </Link>
                            </>
                        ) : (
                            <div className="relative">

                                <button
                                    onClick={() =>
                                        setProfileMenu(!profileMenu)
                                    }
                                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50"
                                >

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                        {member?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "M"}
                                    </div>

                                    <div className="text-left">

                                        <p className="max-w-32 truncate text-sm font-semibold text-gray-900">
                                            {member?.name || "Member"}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Member
                                        </p>

                                    </div>

                                    <ChevronDown size={16} />

                                </button>


                                {profileMenu && (
                                    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg">

                                        <Link
                                            to="/dashboard"
                                            onClick={() =>
                                                setProfileMenu(false)
                                            }
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Dashboard
                                        </Link>

                                        <Link
                                            to="/bookings"
                                            onClick={() =>
                                                setProfileMenu(false)
                                            }
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <CalendarDays size={16} />
                                            My Bookings
                                        </Link>

                                        <Link
                                            to="/profile"
                                            onClick={() =>
                                                setProfileMenu(false)
                                            }
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Profile
                                        </Link>

                                        <div className="my-1 border-t border-gray-100" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Sign Out
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}

                    </div>


                    {/* MOBILE BUTTON */}

                    <button
                        onClick={() =>
                            setMobileMenu(!mobileMenu)
                        }
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                    >
                        {mobileMenu ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                </div>


                {/* MOBILE MENU */}

                {mobileMenu && (
                    <div className="border-t border-gray-100 py-4 lg:hidden">

                        <nav className="space-y-1">

                            {navigation.map((item) => (

                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() =>
                                        setMobileMenu(false)
                                    }
                                    className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                                        isActive(item.path)
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {item.name}
                                </Link>

                            ))}

                        </nav>


                        <div className="mt-4 border-t border-gray-100 pt-4">

                            {!authenticated ? (
                                <div className="space-y-2">

                                    <Link
                                        to="/login"
                                        onClick={() =>
                                            setMobileMenu(false)
                                        }
                                        className="block rounded-xl px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        to="/register"
                                        onClick={() =>
                                            setMobileMenu(false)
                                        }
                                        className="block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
                                    >
                                        Become a Member
                                    </Link>

                                </div>
                            ) : (
                                <div className="space-y-1">

                                    <Link
                                        to="/dashboard"
                                        onClick={() =>
                                            setMobileMenu(false)
                                        }
                                        className="block rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/bookings"
                                        onClick={() =>
                                            setMobileMenu(false)
                                        }
                                        className="block rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        My Bookings
                                    </Link>

                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setMobileMenu(false)
                                        }
                                        className="block rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Profile
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Sign Out
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>
                )}

            </div>

        </header>
    );
}