import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    MapPin,
    Trash2,
    RefreshCw,
} from "lucide-react";

import {
    getBookings,
    deleteBooking,
} from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            setError("");

            const data = await getBookings();

            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.message || "Unable to load your bookings."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(bookingId) {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(bookingId);

            await deleteBooking(bookingId);

            setBookings((current) =>
                current.filter(
                    (booking) =>
                        booking.bookingId !== bookingId
                )
            );
        } catch (err) {
            setError(
                err.message || "Unable to cancel booking."
            );
        } finally {
            setDeletingId(null);
        }
    }

    function getStatusClasses(status) {
        const value = status?.toLowerCase();

        if (value === "confirmed") {
            return "bg-green-100 text-green-700";
        }

        if (value === "pending") {
            return "bg-yellow-100 text-yellow-700";
        }

        if (
            value === "cancelled" ||
            value === "canceled"
        ) {
            return "bg-red-100 text-red-700";
        }

        return "bg-gray-100 text-gray-600";
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner text="Loading your bookings..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-blue-600">
                        BOOKINGS
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-gray-900">
                        My Bookings
                    </h1>

                    <p className="mt-2 text-gray-500">
                        View and manage your facility bookings.
                    </p>
                </div>

                <button
                    onClick={loadBookings}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-600">
                        {error}
                    </p>
                </div>
            )}

            {/* EMPTY STATE */}
            {!error && bookings.length === 0 && (
                <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <CalendarDays size={32} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-gray-900">
                        No bookings yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        You haven't made any facility bookings yet.
                        Browse available facilities and book your next
                        game.
                    </p>
                </div>
            )}

            {/* BOOKINGS */}
            {bookings.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">

                    {bookings.map((booking) => (
                        <div
                            key={booking.bookingId}
                            className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >

                            {/* TOP */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">

                                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

                                <div className="relative flex items-start justify-between gap-4">

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                                            Booking
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold">
                                            {booking.facility?.facilityName ||
                                                booking.facilityName ||
                                                "Sports Facility"}
                                        </h2>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status ||
                                            "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6">

                                <div className="grid gap-4 sm:grid-cols-2">

                                    {/* DATE */}
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                            <CalendarDays size={19} />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Date
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {booking.bookingDate
                                                    ? new Date(
                                                        booking.bookingDate
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )
                                                    : "Not available"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* TIME */}
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
                                            <Clock size={19} />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                Time
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-900">
                                                {booking.startTime ||
                                                    "--"}{" "}
                                                -{" "}
                                                {booking.endTime ||
                                                    "--"}
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                {/* LOCATION */}
                                <div className="mt-5 flex items-start gap-3 border-t border-gray-100 pt-5">
                                    <div className="rounded-xl bg-green-50 p-2.5 text-green-600">
                                        <MapPin size={19} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Location
                                        </p>

                                        <p className="mt-1 font-medium text-gray-900">
                                            {booking.facility?.location ||
                                                booking.location ||
                                                "Location unavailable"}
                                        </p>

                                        {booking.facility?.address && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {
                                                    booking
                                                        .facility
                                                        .address
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* DELETE */}
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            booking.bookingId
                                        )
                                    }
                                    disabled={
                                        deletingId ===
                                        booking.bookingId
                                    }
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 size={17} />

                                    {deletingId ===
                                    booking.bookingId
                                        ? "Cancelling..."
                                        : "Cancel Booking"}
                                </button>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}