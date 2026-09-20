import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Loader2,
    MapPin,
    X,
    XCircle,
} from "lucide-react";

import {
    cancelBooking,
    getMyBookings,
} from "../services/api";


// ============================================================
// TYPES
// ============================================================

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

type BookingFilter =
    | "All"
    | "Upcoming"
    | "Completed"
    | "Cancelled";


// ============================================================
// COMPONENT
// ============================================================

export default function MyBookings() {

    // ========================================================
    // STATE
    // ========================================================

    const [bookings, setBookings] =
        useState<Booking[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [cancellingId, setCancellingId] =
        useState<number | null>(null);

    const [bookingToCancel, setBookingToCancel] =
        useState<Booking | null>(null);

    const [filter, setFilter] =
        useState<BookingFilter>("All");

    const [currentPage, setCurrentPage] =
        useState(1);

    const BOOKINGS_PER_PAGE = 5;


    // ========================================================
    // LOAD BOOKINGS
    // ========================================================

    useEffect(() => {

        const loadBookings = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getMyBookings();

                setBookings(
                    Array.isArray(data)
                        ? data
                        : []
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


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate = (
        date?: string
    ) => {

        if (!date) {
            return "Date not available";
        }

        const value =
            String(date).substring(0, 10);

        const [
            year,
            month,
            day,
        ] = value.split("-");

        if (
            !year ||
            !month ||
            !day
        ) {
            return date;
        }

        return `${day}/${month}/${year}`;
    };


    // ========================================================
    // FORMAT TIME
    // ========================================================

    const formatTime = (
        time?: string
    ) => {

        if (!time) {
            return "--";
        }

        const value =
            String(time).substring(0, 5);

        const [
            hours,
            minutes,
        ] = value.split(":");

        const hour =
            Number(hours);

        if (
            Number.isNaN(hour)
        ) {
            return value;
        }

        const period =
            hour >= 12
                ? "PM"
                : "AM";

        const displayHour =
            hour % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    };


    // ========================================================
    // STATUS HELPERS
    // ========================================================

    const getStatus = (
        booking: Booking
    ) => {

        return String(
            booking.status || ""
        )
            .trim()
            .toLowerCase();
    };


    const isCancelled = (
        booking: Booking
    ) => {

        const status =
            getStatus(booking);

        return (
            status === "cancelled" ||
            status === "canceled"
        );
    };


    const isCompleted = (
        booking: Booking
    ) => {

        return (
            getStatus(booking) ===
            "completed"
        );
    };


    const isUpcoming = (
        booking: Booking
    ) => {

        if (
            isCancelled(booking) ||
            isCompleted(booking)
        ) {
            return false;
        }

        if (
            !booking.bookingDate
        ) {
            return true;
        }

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        const rawDate =
            booking.bookingDate.substring(
                0,
                10
            );

        const bookingDate =
            new Date(
                `${rawDate}T00:00:00`
            );

        if (
            Number.isNaN(
                bookingDate.getTime()
            )
        ) {
            return true;
        }

        return (
            bookingDate >= today
        );
    };


    // ========================================================
    // FILTER BOOKINGS
    // ========================================================

    const filteredBookings =
        useMemo(() => {

            return bookings.filter(
                (booking) => {

                    if (
                        filter === "All"
                    ) {
                        return true;
                    }

                    if (
                        filter === "Upcoming"
                    ) {
                        return isUpcoming(
                            booking
                        );
                    }

                    if (
                        filter === "Completed"
                    ) {
                        return isCompleted(
                            booking
                        );
                    }

                    if (
                        filter === "Cancelled"
                    ) {
                        return isCancelled(
                            booking
                        );
                    }

                    return true;
                }
            );

        }, [
            bookings,
            filter,
        ]);


    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredBookings.length /
                BOOKINGS_PER_PAGE
            )
        );


    const paginatedBookings =
        useMemo(() => {

            const startIndex =
                (currentPage - 1) *
                BOOKINGS_PER_PAGE;

            const endIndex =
                startIndex +
                BOOKINGS_PER_PAGE;

            return filteredBookings.slice(
                startIndex,
                endIndex
            );

        }, [
            filteredBookings,
            currentPage,
        ]);


    // ========================================================
    // KEEP CURRENT PAGE VALID
    // ========================================================

    useEffect(() => {

        if (
            currentPage >
            totalPages
        ) {
            setCurrentPage(
                totalPages
            );
        }

    }, [
        currentPage,
        totalPages,
    ]);


    // ========================================================
    // CHANGE FILTER
    // ========================================================

    const handleFilterChange = (
        newFilter: BookingFilter
    ) => {

        setFilter(
            newFilter
        );

        setCurrentPage(1);
    };


    // ========================================================
    // OPEN CANCEL MODAL
    // ========================================================

    const handleCancel = (
        booking: Booking
    ) => {

        setError("");

        setBookingToCancel(
            booking
        );
    };


    // ========================================================
    // CLOSE CANCEL MODAL
    // ========================================================

    const closeCancelModal = () => {

        if (
            cancellingId !== null
        ) {
            return;
        }

        setBookingToCancel(
            null
        );
    };


    // ========================================================
    // CONFIRM CANCELLATION
    // ========================================================

    const confirmCancelBooking =
        async () => {

            if (
                !bookingToCancel
            ) {
                return;
            }

            const bookingId =
                bookingToCancel.bookingId;

            try {

                setCancellingId(
                    bookingId
                );

                setError("");

                await cancelBooking(
                    bookingId
                );

                setBookings(
                    (
                        currentBookings
                    ) =>
                        currentBookings.map(
                            (
                                booking
                            ) =>
                                booking.bookingId ===
                                    bookingId
                                    ? {
                                        ...booking,
                                        status: "Cancelled",
                                    }
                                    : booking
                        )
                );

                setBookingToCancel(
                    null
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to cancel the booking."
                );

            } finally {

                setCancellingId(
                    null
                );

            }
        };


    // ========================================================
    // STATUS BADGE
    // ========================================================

    const statusBadge = (
        booking: Booking
    ) => {

        const status =
            getStatus(booking);

        if (
            status === "cancelled" ||
            status === "canceled"
        ) {

            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">

                    <XCircle size={13} />

                    Cancelled

                </span>
            );
        }

        if (
            status === "completed"
        ) {

            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

                    <CheckCircle2
                        size={13}
                    />

                    Completed

                </span>
            );
        }

        if (
            status === "confirmed"
        ) {

            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">

                    <CheckCircle2
                        size={13}
                    />

                    Confirmed

                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">

                {booking.status ||
                    "Pending"}

            </span>
        );
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <main className="min-h-screen bg-slate-50">

                <section className="border-b border-slate-200 bg-white">

                    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

                        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />

                    </div>

                </section>

                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                    <div className="space-y-5">

                        {[1, 2, 3].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="h-52 animate-pulse rounded-2xl bg-white"
                                />

                            )
                        )}

                    </div>

                </div>

            </main>
        );
    }


    // ========================================================
    // PAGE
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50">


            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        My Bookings
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View and manage your facility reservations.
                    </p>

                </div>
            </section>

            <main className="bg-slate-50">

                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

                    {error && (

                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                            <XCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}

                    <div className="flex flex-wrap gap-2">

                        {(
                            [
                                "All",
                                "Upcoming",
                                "Completed",
                                "Cancelled",
                            ] as BookingFilter[]
                        ).map(
                            (item) => (

                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        handleFilterChange(
                                            item
                                        )
                                    }
                                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${filter === item
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-white text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    {item}
                                </button>

                            )
                        )}

                    </div>


                    {filteredBookings.length ===
                        0 && (

                            <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                    <CalendarDays
                                        size={28}
                                    />

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

                                    <ArrowRight
                                        size={16}
                                    />

                                </Link>

                            </div>

                        )}


                    {paginatedBookings.length >
                        0 && (

                            <div className="mt-6 space-y-5">

                                {paginatedBookings.map(
                                    (booking) => (

                                        <div
                                            key={
                                                booking.bookingId
                                            }
                                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                                        >

                                            <div className="p-6 sm:p-7">

                                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">


                                                    {/* FACILITY */}

                                                    <div className="flex min-w-0 gap-4">

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                            <CalendarDays
                                                                size={22}
                                                            />

                                                        </div>

                                                        <div className="min-w-0">

                                                            <div className="flex flex-wrap items-center gap-3">

                                                                <h2 className="text-lg font-bold text-slate-900">

                                                                    {booking
                                                                        .facility
                                                                        ?.facilityName ||
                                                                        `Facility #${booking.facilityId}`}

                                                                </h2>

                                                                {statusBadge(
                                                                    booking
                                                                )}

                                                            </div>

                                                            <p className="mt-1 text-sm text-slate-500">

                                                                {booking
                                                                    .facility
                                                                    ?.sport
                                                                    ?.sportName ||
                                                                    "Sports Facility"}

                                                            </p>

                                                        </div>

                                                    </div>


                                                    {/* BOOKING ID */}

                                                    <p className="text-xs font-medium text-slate-400">

                                                        Booking #
                                                        {
                                                            booking.bookingId
                                                        }

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
                                                                )}

                                                                {" — "}

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

                                                                {booking
                                                                    .facility
                                                                    ?.location ||
                                                                    booking
                                                                        .facility
                                                                        ?.address ||
                                                                    "Location not available"}

                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>


                                                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                                    <Link
                                                        to={`/facility/${booking.facilityId}`}
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                                    >

                                                        View facility

                                                        <ArrowRight
                                                            size={15}
                                                        />

                                                    </Link>


                                                    {isUpcoming(
                                                        booking
                                                    ) &&
                                                        !isCancelled(
                                                            booking
                                                        ) && (

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    cancellingId ===
                                                                    booking.bookingId
                                                                }
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        booking
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >

                                                                <XCircle
                                                                    size={16}
                                                                />

                                                                Cancel Booking

                                                            </button>

                                                        )}

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    {filteredBookings.length >
                        BOOKINGS_PER_PAGE && (

                            <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">


                                {/* RESULT COUNT */}

                                <p className="text-sm text-slate-500">

                                    Showing{" "}

                                    <span className="font-semibold text-slate-700">

                                        {(currentPage - 1) *
                                            BOOKINGS_PER_PAGE +
                                            1}

                                    </span>

                                    {" – "}

                                    <span className="font-semibold text-slate-700">

                                        {Math.min(
                                            currentPage *
                                            BOOKINGS_PER_PAGE,
                                            filteredBookings.length
                                        )}

                                    </span>

                                    {" of "}

                                    <span className="font-semibold text-slate-700">

                                        {
                                            filteredBookings.length
                                        }

                                    </span>

                                    {" bookings"}

                                </p>


                                {/* BUTTONS */}

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage === 1
                                        }
                                        onClick={() => {
                                            setCurrentPage(
                                                (previousPage) =>
                                                    Math.max(
                                                        1,
                                                        previousPage -
                                                        1
                                                    )
                                            );
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >

                                        <ChevronLeft
                                            size={16}
                                        />

                                        Previous

                                    </button>


                                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-bold text-white">

                                        {currentPage}

                                    </div>


                                    <span className="px-1 text-sm text-slate-400">

                                        of {totalPages}

                                    </span>


                                    <button
                                        type="button"
                                        disabled={
                                            currentPage >=
                                            totalPages
                                        }
                                        onClick={() => {
                                            setCurrentPage(
                                                (previousPage) =>
                                                    Math.min(
                                                        totalPages,
                                                        previousPage +
                                                        1
                                                    )
                                            );
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >

                                        Next

                                        <ChevronRight
                                            size={16}
                                        />

                                    </button>

                                </div>

                            </div>

                        )}

                </div>

            </main>

            {bookingToCancel && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(
                        event
                    ) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCancelModal();
                        }

                    }}
                >

                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">


                        <div className="flex items-start justify-between px-6 pb-2 pt-6">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">

                                <XCircle
                                    size={25}
                                />

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeCancelModal
                                }
                                disabled={
                                    cancellingId !==
                                    null
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close confirmation"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <div className="px-6 pb-6 pt-3">

                            <h2 className="text-xl font-bold text-slate-900">
                                Cancel this booking?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Are you sure you want to cancel this
                                reservation? This action cannot be
                                undone.
                            </p>


                            {/* BOOKING INFORMATION */}

                            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                                <p className="font-semibold text-slate-900">

                                    {bookingToCancel
                                        .facility
                                        ?.facilityName ||
                                        `Facility #${bookingToCancel.facilityId}`}

                                </p>


                                <div className="mt-3 space-y-2.5">


                                    {/* DATE */}

                                    <div className="flex items-center gap-2.5 text-sm text-slate-500">

                                        <CalendarDays
                                            size={16}
                                            className="shrink-0"
                                        />

                                        <span>

                                            {formatDate(
                                                bookingToCancel.bookingDate
                                            )}

                                        </span>

                                    </div>


                                    {/* TIME */}

                                    <div className="flex items-center gap-2.5 text-sm text-slate-500">

                                        <Clock3
                                            size={16}
                                            className="shrink-0"
                                        />

                                        <span>

                                            {formatTime(
                                                bookingToCancel.startTime
                                            )}

                                            {" — "}

                                            {formatTime(
                                                bookingToCancel.endTime
                                            )}

                                        </span>

                                    </div>


                                    {/* LOCATION */}

                                    <div className="flex items-center gap-2.5 text-sm text-slate-500">

                                        <MapPin
                                            size={16}
                                            className="shrink-0"
                                        />

                                        <span>

                                            {bookingToCancel
                                                .facility
                                                ?.location ||
                                                bookingToCancel
                                                    .facility
                                                    ?.address ||
                                                "Location not available"}

                                        </span>

                                    </div>

                                </div>

                            </div>

                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeCancelModal
                                    }
                                    disabled={
                                        cancellingId !==
                                        null
                                    }
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Keep Booking
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        confirmCancelBooking
                                    }
                                    disabled={
                                        cancellingId !==
                                        null
                                    }
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {cancellingId !==
                                        null ? (
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

                                            Yes, Cancel
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}