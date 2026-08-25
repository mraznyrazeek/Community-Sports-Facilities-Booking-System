import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    XCircle,
} from "lucide-react";

import {
    cancelBooking,
    getMyBookings,
} from "../services/api";

interface Booking {
    bookingId: number;
    memberId?: number;
    facilityId?: number;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    createdAt?: string;

    facility?: {
        facilityId?: number;
        facilityName?: string;
        location?: string;
        address?: string;
        openingTime?: string;
        closingTime?: string;

        sport?: {
            sportId?: number;
            sportName?: string;
        };
    };
}

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] =
        useState<number | null>(null);

    const [filter, setFilter] = useState<
        "All" | "Upcoming" | "Completed" | "Cancelled"
    >("All");

    // ---------------------------------------------------------
    // LOAD BOOKINGS
    // ---------------------------------------------------------

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyBookings();

                setBookings(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your bookings."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

    // ---------------------------------------------------------
    // FORMAT DATE
    // ---------------------------------------------------------

    const formatDate = (date?: string) => {
        if (!date) {
            return "Date not available";
        }

        const value = String(date).substring(0, 10);

        const [year, month, day] = value.split("-");

        if (!year || !month || !day) {
            return date;
        }

        return `${day}/${month}/${year}`;
    };

    // ---------------------------------------------------------
    // FORMAT TIME
    // ---------------------------------------------------------

    const formatTime = (time?: string) => {
        if (!time) {
            return "--";
        }

        const value = String(time).substring(0, 5);
        const [hours, minutes] = value.split(":");

        const hour = Number(hours);

        if (Number.isNaN(hour)) {
            return value;
        }

        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    };

    // ---------------------------------------------------------
    // BOOKING STATUS
    // ---------------------------------------------------------

    const getStatus = (booking: Booking) => {
        return String(booking.status || "")
            .trim()
            .toLowerCase();
    };

    const isCancelled = (booking: Booking) => {
        const status = getStatus(booking);

        return (
            status === "cancelled" ||
            status === "canceled"
        );
    };

    const isCompleted = (booking: Booking) => {
        const status = getStatus(booking);

        return status === "completed";
    };

    const isUpcoming = (booking: Booking) => {
        if (isCancelled(booking) || isCompleted(booking)) {
            return false;
        }

        if (!booking.bookingDate) {
            return true;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(
            `${booking.bookingDate.substring(0, 10)}T00:00:00`
        );

        return bookingDate >= today;
    };

    // ---------------------------------------------------------
    // FILTER BOOKINGS
    // ---------------------------------------------------------

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            if (filter === "All") {
                return true;
            }

            if (filter === "Upcoming") {
                return isUpcoming(booking);
            }

            if (filter === "Completed") {
                return isCompleted(booking);
            }

            if (filter === "Cancelled") {
                return isCancelled(booking);
            }

            return true;
        });
    }, [bookings, filter]);

    // ---------------------------------------------------------
    // CANCEL BOOKING
    // ---------------------------------------------------------

    const handleCancel = async (bookingId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(bookingId);
            setError("");

            await cancelBooking(bookingId);

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.bookingId === bookingId
                        ? {
                              ...booking,
                              status: "Cancelled",
                          }
                        : booking
                )
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to cancel the booking."
            );
        } finally {
            setCancellingId(null);
        }
    };

    // ---------------------------------------------------------
    // STATUS BADGE
    // ---------------------------------------------------------

    const statusBadge = (booking: Booking) => {
        const status = getStatus(booking);

        if (status === "cancelled" || status === "canceled") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <XCircle size={13} />
                    Cancelled
                </span>
            );
        }

        if (status === "completed") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <CheckCircle2 size={13} />
                    Completed
                </span>
            );
        }

        if (status === "confirmed") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={13} />
                    Confirmed
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                {booking.status || "Pending"}
            </span>
        );
    };

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />

                    <div className="mt-8 space-y-5">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-52 animate-pulse rounded-2xl bg-white"
                            />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    // ---------------------------------------------------------
    // PAGE
    // ---------------------------------------------------------

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

                {/* HEADER */}
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-600">
                        <CalendarDays size={14} />
                        My Bookings
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        My bookings
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                        View and manage your facility reservations.
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* FILTERS */}
                <div className="mt-8 flex flex-wrap gap-2">
                    {(
                        [
                            "All",
                            "Upcoming",
                            "Completed",
                            "Cancelled",
                        ] as const
                    ).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                filter === item
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* EMPTY */}
                {filteredBookings.length === 0 && (
                    <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <CalendarDays size={28} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            No bookings found
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {filter === "All"
                                ? "You have not created any facility bookings yet."
                                : `You do not have any ${filter.toLowerCase()} bookings.`}
                        </p>

                        <Link
                            to="/facilities"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Browse Facilities
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {/* BOOKINGS */}
                {filteredBookings.length > 0 && (
                    <div className="mt-6 space-y-5">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.bookingId}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="p-6 sm:p-7">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                        {/* FACILITY */}
                                        <div className="flex min-w-0 gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <CalendarDays size={22} />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className="text-lg font-bold text-slate-900">
                                                        {booking.facility?.facilityName ||
                                                            `Facility #${booking.facilityId}`}
                                                    </h2>

                                                    {statusBadge(booking)}
                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {booking.facility?.sport?.sportName ||
                                                        "Sports Facility"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* BOOKING ID */}
                                        <p className="text-xs font-medium text-slate-400">
                                            Booking #{booking.bookingId}
                                        </p>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">

                                        {/* DATE */}
                                        <div className="flex items-start gap-3">
                                            <CalendarDays
                                                size={18}
                                                className="mt-0.5 text-slate-400"
                                            />

                                            <div>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Date
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                                    {formatDate(
                                                        booking.bookingDate
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* TIME */}
                                        <div className="flex items-start gap-3">
                                            <Clock3
                                                size={18}
                                                className="mt-0.5 text-slate-400"
                                            />

                                            <div>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Time
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                                    {formatTime(
                                                        booking.startTime
                                                    )}{" "}
                                                    —{" "}
                                                    {formatTime(
                                                        booking.endTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* LOCATION */}
                                        <div className="flex items-start gap-3">
                                            <MapPin
                                                size={18}
                                                className="mt-0.5 text-slate-400"
                                            />

                                            <div>
                                                <p className="text-xs font-medium text-slate-400">
                                                    Location
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                                    {booking.facility?.location ||
                                                        booking.facility?.address ||
                                                        "Location not available"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <Link
                                            to={`/facility/${booking.facilityId}`}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            View facility
                                            <ArrowRight size={15} />
                                        </Link>

                                        {isUpcoming(booking) &&
                                            !isCancelled(booking) && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        cancellingId ===
                                                        booking.bookingId
                                                    }
                                                    onClick={() =>
                                                        handleCancel(
                                                            booking.bookingId
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {cancellingId ===
                                                    booking.bookingId ? (
                                                        <>
                                                            <Loader2
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                            Cancelling...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle
                                                                size={16}
                                                            />
                                                            Cancel Booking
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}