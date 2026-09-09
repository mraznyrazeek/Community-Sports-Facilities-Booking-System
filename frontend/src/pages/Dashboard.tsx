import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    ChevronRight,
    Clock3,
    Mail,
    MapPin,
    Settings,
    Star,
    Trophy,
    User,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
    getCurrentMember,
    getMyBookings,
    getMySports,
} from "../services/api";

type Member = {
    memberId?: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
};

type Booking = {
    bookingId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    facilityId?: number;
    facility?: {
        facilityId?: number;
        facilityName?: string;
        location?: string;
    } | null;
};

type MemberSport = {
    sportId: number;
    sport?: {
        sportId?: number;
        sportName?: string;
        description?: string;
    } | null;
};

export default function Dashboard() {
    const member = getCurrentMember() as Member | null;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [sports, setSports] = useState<MemberSport[]>([]);

    const [loadingBookings, setLoadingBookings] =
        useState(true);

    const [loadingSports, setLoadingSports] =
        useState(true);

    const [bookingError, setBookingError] =
        useState("");

    const [sportsError, setSportsError] =
        useState("");

    // ============================================================
    // MEMBER NAME
    // ============================================================

    const memberName = useMemo(() => {
        if (member?.firstName && member?.lastName) {
            return `${member.firstName} ${member.lastName}`;
        }

        if (member?.firstName) {
            return member.firstName;
        }

        if (member?.name) {
            return member.name;
        }

        return "Member";
    }, [member]);

    // ============================================================
    // GREETING
    // ============================================================

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 18) {
            return "Good afternoon";
        }

        return "Good evening";
    }, []);

    // ============================================================
    // INITIALS
    // ============================================================

    const initials = useMemo(() => {
        if (member?.firstName && member?.lastName) {
            return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                .toUpperCase();
        }

        if (member?.firstName) {
            return member.firstName.charAt(0).toUpperCase();
        }

        if (member?.name) {
            const parts = member.name
                .trim()
                .split(/\s+/);

            if (parts.length >= 2) {
                return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`
                    .toUpperCase();
            }

            return parts[0]?.charAt(0).toUpperCase() || "M";
        }

        return "M";
    }, [member]);

    // ============================================================
    // LOAD BOOKINGS
    // ============================================================

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setLoadingBookings(true);
                setBookingError("");

                const data = await getMyBookings();

                setBookings(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error) {
                console.error(
                    "Failed to load member bookings:",
                    error
                );

                setBookingError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load your bookings."
                );
            } finally {
                setLoadingBookings(false);
            }
        };

        loadBookings();
    }, []);

    // ============================================================
    // LOAD SPORTS
    // ============================================================

    useEffect(() => {
        const loadSports = async () => {
            try {
                setLoadingSports(true);
                setSportsError("");

                const data = await getMySports();

                setSports(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error) {
                console.error(
                    "Failed to load member sports:",
                    error
                );

                setSportsError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load your sports."
                );
            } finally {
                setLoadingSports(false);
            }
        };

        loadSports();
    }, []);

    // ============================================================
    // UPCOMING BOOKING
    // ============================================================

    const upcomingBooking = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = bookings
            .filter((booking) => {
                const bookingDate = new Date(
                    booking.bookingDate
                );

                bookingDate.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    bookingDate >= today &&
                    booking.status?.toLowerCase() !==
                    "cancelled"
                );
            })
            .sort((a, b) => {
                const first =
                    new Date(
                        `${a.bookingDate}T${a.startTime}`
                    ).getTime();

                const second =
                    new Date(
                        `${b.bookingDate}T${b.startTime}`
                    ).getTime();

                return first - second;
            });

        return upcoming[0] || null;
    }, [bookings]);

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (value?: string) => {
        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            undefined,
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (value?: string) => {
        if (!value) {
            return "";
        }

        const parts = value.split(":");

        if (parts.length < 2) {
            return value;
        }

        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
        ) {
            return value;
        }

        const date = new Date();

        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);

        return date.toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    // ============================================================
    // STATUS STYLE
    // ============================================================

    const bookingStatusClass = (
        status?: string
    ) => {
        switch (
        status?.toLowerCase()
        ) {
            case "confirmed":
            case "approved":
                return "bg-emerald-50 text-emerald-700";

            case "pending":
                return "bg-amber-50 text-amber-700";

            case "cancelled":
                return "bg-red-50 text-red-700";

            case "completed":
                return "bg-blue-50 text-blue-700";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                PAGE
            ===================================================== */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

                {/* =================================================
                    WELCOME HEADER
                ================================================= */}

                <section className="relative overflow-hidden rounded-3xl bg-slate-950">

                    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950" />

                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

                    <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative flex flex-col gap-8 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:p-10">

                        <div>

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-blue-100 backdrop-blur">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Member dashboard
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                {greeting},{" "}
                                {memberName}
                                <span className="ml-1">
                                    👋
                                </span>
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">
                                Ready for your next game?
                                Find a facility, manage your
                                bookings and keep your sports
                                activity organised.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                                <Link
                                    to="/facilities"
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
                                >
                                    Find a Facility

                                    <ArrowRight
                                        size={16}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </Link>

                                {/* <Link
                                    to="/profile/bookings"
                                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                                >
                                    My Bookings
                                </Link> */}

                            </div>

                        </div>

                        {/* MEMBER PROFILE SUMMARY */}

                        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl lg:w-72">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-blue-700 shadow-sm">
                                    {initials}
                                </div>

                                <div className="min-w-0">

                                    <p className="truncate text-base font-bold text-white">
                                        {memberName}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-blue-100/70">
                                        {member?.email ||
                                            "Community Member"}
                                    </p>

                                </div>

                            </div>

                            <div className="mt-4 border-t border-white/10 pt-4">

                                <Link
                                    to="/settings"
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-blue-100 transition hover:text-white"
                                >
                                    View profile

                                    <ChevronRight size={14} />
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    QUICK ACCESS
                ================================================= */}

                <section className="mt-10">

                    <div className="flex items-end justify-between">

                        <div>

                            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Quick access
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                                Everything in one place
                            </h2>

                        </div>

                    </div>


                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                        {/* BOOKINGS */}

                        <DashboardLink
                            to="/profile/bookings"
                            icon={<CalendarDays size={21} />}
                            title="My Bookings"
                            description="View and manage bookings"
                            iconClass="bg-blue-50 text-blue-600"
                        />

                        {/* SPORTS */}

                        <DashboardLink
                            to="/profile/sports"
                            icon={<Trophy size={21} />}
                            title="My Sports"
                            description="Manage your favourite sports"
                            iconClass="bg-violet-50 text-violet-600"
                        />

                        {/* REVIEWS */}

                        <DashboardLink
                            to="/reviews"
                            icon={<Star size={21} />}
                            title="My Reviews"
                            description="View your submitted reviews"
                            iconClass="bg-fuchsia-50 text-fuchsia-600"
                        />


                        {/* INQUIRIES */}

                        <DashboardLink
                            to="/inquiries"
                            icon={<Mail size={21} />}
                            title="My Inquiries"
                            description="Contact the community"
                            iconClass="bg-amber-50 text-amber-600"
                        />

                        {/* SETTINGS */}

                        <DashboardLink
                            to="/settings"
                            icon={<Settings size={21} />}
                            title="Settings"
                            description="Account and security"
                            iconClass="bg-slate-100 text-slate-600"
                        />

                    </div>

                </section>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">

                    {/* =================================================
                        UPCOMING BOOKING
                    ================================================= */}

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <p className="text-sm font-semibold text-blue-600">
                                    Your schedule
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-950">
                                    Upcoming booking
                                </h2>

                            </div>

                            <Link
                                to="/profile/bookings"
                                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                            >
                                View all
                            </Link>

                        </div>


                        <div className="p-6">

                            {loadingBookings ? (

                                <div className="space-y-4">

                                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />

                                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />

                                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

                                </div>

                            ) : bookingError ? (

                                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                                    <p className="text-sm font-semibold text-red-700">
                                        Unable to load your booking.
                                    </p>

                                    <p className="mt-1 text-xs text-red-600">
                                        {bookingError}
                                    </p>

                                </div>

                            ) : upcomingBooking ? (

                                <div className="overflow-hidden rounded-2xl border border-slate-200">

                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">

                                        <div className="flex items-start justify-between gap-4">

                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                                                    Upcoming session
                                                </p>

                                                <h3 className="mt-2 text-xl font-bold text-white">
                                                    {upcomingBooking.facility?.facilityName ||
                                                        "Sports Facility"}
                                                </h3>

                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${bookingStatusClass(
                                                    upcomingBooking.status
                                                )
                                                    }`}
                                            >
                                                {upcomingBooking.status ||
                                                    "Pending"}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">

                                        <div className="flex items-start gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                <CalendarDays size={17} />
                                            </div>

                                            <div>

                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Date
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {formatDate(
                                                        upcomingBooking.bookingDate
                                                    )}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex items-start gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                                <Clock3 size={17} />
                                            </div>

                                            <div>

                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Time
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {formatTime(
                                                        upcomingBooking.startTime
                                                    )}{" "}
                                                    –{" "}
                                                    {formatTime(
                                                        upcomingBooking.endTime
                                                    )}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex items-start gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                                <MapPin size={17} />
                                            </div>

                                            <div>

                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Location
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {upcomingBooking.facility?.location ||
                                                        "Location unavailable"}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    <div className="border-t border-slate-100 px-5 py-4">

                                        <Link
                                            to="/profile/bookings"
                                            className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
                                        >
                                            View booking details

                                            <ArrowRight
                                                size={15}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </Link>

                                    </div>

                                </div>

                            ) : (

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                                        <CalendarDays size={27} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                                        No upcoming bookings
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                        Find a facility and book your next
                                        game when you're ready.
                                    </p>

                                    <Link
                                        to="/facilities"
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                                    >
                                        Find a Facility

                                        <ArrowRight size={15} />
                                    </Link>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        MY SPORTS
                    ================================================= */}

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <p className="text-sm font-semibold text-violet-600">
                                    Your interests
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-950">
                                    My sports
                                </h2>

                            </div>

                            <Link
                                to="/profile/sports"
                                className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
                            >
                                Manage
                            </Link>

                        </div>


                        <div className="p-6">

                            {loadingSports ? (

                                <div className="grid grid-cols-2 gap-3">

                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className="h-20 animate-pulse rounded-xl bg-slate-100"
                                        />
                                    ))}

                                </div>

                            ) : sportsError ? (

                                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                                    <p className="text-sm font-semibold text-red-700">
                                        Unable to load your sports.
                                    </p>

                                    <p className="mt-1 text-xs text-red-600">
                                        {sportsError}
                                    </p>

                                </div>

                            ) : sports.length > 0 ? (

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                    {sports.slice(0, 6).map((item) => (

                                        <div
                                            key={item.sportId}
                                            className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-sm"
                                        >

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                                                    <Trophy size={18} />
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-bold text-slate-900">
                                                        {item.sport?.sportName ||
                                                            "Sport"}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                                        Registered sport
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                                        <Trophy size={23} />
                                    </div>

                                    <h3 className="mt-4 text-base font-bold text-slate-900">
                                        No sports yet
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Add your favourite sports to
                                        personalise your member experience.
                                    </p>

                                    <Link
                                        to="/profile/sports"
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                                    >
                                        Add Sports

                                        <ArrowRight size={14} />
                                    </Link>

                                </div>

                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}


/* ================================================================
   DASHBOARD QUICK ACCESS CARD
================================================================ */

function DashboardLink({
    to,
    icon,
    title,
    description,
    iconClass,
}: {
    to: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    iconClass: string;
}) {
    return (
        <Link
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >

            <div className="flex items-start justify-between gap-3">

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} transition group-hover:scale-105`}
                >
                    {icon}
                </div>

                <ArrowRight
                    size={16}
                    className="mt-1 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
                />

            </div>

            <h3 className="mt-5 text-sm font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
            </p>

        </Link>
    );
}