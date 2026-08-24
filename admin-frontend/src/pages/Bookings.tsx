import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  Clock,
  Search,
  X,
} from "lucide-react";

import {
  getBookings,
  confirmBooking,
  cancelBooking,
} from "../services/api";

import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const BOOKINGS_PER_PAGE = 10;

  const [bookingPage, setBookingPage] =
    useState(1);

  const [bookingDate, setBookingDate] =
    useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);

      const data = await getBookings();

      setBookings(data || []);
    } catch (error) {
      console.error(
        "Failed to load bookings:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirm = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to confirm this booking?"
      )
    ) {
      return;
    }

    try {
      setProcessingId(id);

      await confirmBooking(id);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.bookingId === id
            ? {
              ...booking,
              status: "Confirmed",
            }
            : booking
        )
      );
    } catch (error: any) {
      console.error(
        "Failed to confirm booking:",
        error
      );

      alert(
        error?.message ||
        "Unable to confirm booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking?"
      )
    ) {
      return;
    }

    try {
      setProcessingId(id);

      await cancelBooking(id);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.bookingId === id
            ? {
              ...booking,
              status: "Cancelled",
            }
            : booking
        )
      );
    } catch (error: any) {
      console.error(
        "Failed to cancel booking:",
        error
      );

      alert(
        error?.message ||
        "Unable to cancel booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return bookings.filter((booking) => {
      const bookingId = String(
        booking.bookingId || ""
      ).toLowerCase();

      const memberName = String(
        booking.member?.name || ""
      ).toLowerCase();

      const memberEmail = String(
        booking.member?.email || ""
      ).toLowerCase();

      const facilityName = String(
        booking.facility?.facilityName || ""
      ).toLowerCase();

      const location = String(
        booking.facility?.location || ""
      ).toLowerCase();

      const status = String(
        booking.status || ""
      ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        bookingId.includes(searchValue) ||
        memberName.includes(searchValue) ||
        memberEmail.includes(searchValue) ||
        facilityName.includes(searchValue) ||
        location.includes(searchValue) ||
        status.includes(searchValue);

      let matchesDate = true;

      if (bookingDate) {
        const rawDate = String(
          booking.bookingDate || ""
        );

        const normalizedBookingDate =
          rawDate.split("T")[0];

        matchesDate =
          normalizedBookingDate ===
          bookingDate;
      }

      return (
        matchesSearch &&
        matchesDate
      );
    });
  }, [
    bookings,
    search,
    bookingDate,
  ]);

  const totalBookingPages = Math.ceil(
    filteredBookings.length /
    BOOKINGS_PER_PAGE
  );

  const paginatedBookings = useMemo(() => {
    const startIndex =
      (bookingPage - 1) *
      BOOKINGS_PER_PAGE;

    return filteredBookings.slice(
      startIndex,
      startIndex + BOOKINGS_PER_PAGE
    );
  }, [
    filteredBookings,
    bookingPage,
  ]);

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "pending"
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "confirmed"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) =>
      String(booking.status).toLowerCase() ===
      "cancelled"
  ).length;

  const getStatusStyle = (
    status: string
  ) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "confirmed") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    if (value === "cancelled") {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    }

    if (value === "pending") {
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    }

    return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
  };

  if (loading) {
    return (
      <LoadingSpinner
        text="Loading bookings..."
      />
    );
  }

  return (
    <div className="space-y-7">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          {/* Small Heading */}

          <p className="text-sm font-semibold text-blue-600">
            Booking Management
          </p>

          {/* Main Heading */}

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Bookings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review, confirm and manage
            community facility bookings.
          </p>

        </div>

        {/* Total */}

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

          <CalendarDays
            size={18}
            className="text-blue-600"
          />

          <span className="text-sm font-semibold text-slate-700">
            {totalBookings} Total Bookings
          </span>

        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Total Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalBookings}
          </p>

        </div>

        {/* Pending */}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <p className="text-sm font-medium text-amber-700">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-800">
            {pendingBookings}
          </p>

        </div>

        {/* Confirmed */}

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

          <p className="text-sm font-medium text-emerald-700">
            Confirmed
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-800">
            {confirmedBookings}
          </p>

        </div>

        {/* Cancelled */}

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <p className="text-sm font-medium text-red-700">
            Cancelled
          </p>

          <p className="mt-2 text-3xl font-bold text-red-800">
            {cancelledBookings}
          </p>

        </div>

      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5">

          <div>

            <h2 className="font-semibold text-slate-900">
              All Bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and manage booking requests.
            </p>

          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            {/* Search */}

            <div className="relative w-full lg:flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setBookingPage(1);
                }}
                placeholder="Search bookings..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Date Filter */}

            <div className="relative w-full lg:w-64">

              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={bookingDate}
                onChange={(event) => {
                  setBookingDate(
                    event.target.value
                  );

                  setBookingPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Clear Date */}

            {bookingDate && (
              <button
                type="button"
                onClick={() => {
                  setBookingDate("");
                  setBookingPage(1);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />
                Clear Date
              </button>
            )}

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px] text-left">

            {/* Table Header */}

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Member
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Facility
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            {/* Table Body */}

            <tbody>

              {paginatedBookings.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center"
                  >

                    <CalendarDays
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      No bookings found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search
                      or date filter.
                    </p>

                  </td>

                </tr>

              ) : (

                paginatedBookings.map(
                  (booking) => {

                    const status =
                      String(
                        booking.status ||
                        "Pending"
                      );

                    const isPending =
                      status.toLowerCase() ===
                      "pending";

                    const isConfirmed =
                      status.toLowerCase() ===
                      "confirmed";

                    const isCancelled =
                      status.toLowerCase() ===
                      "cancelled";

                    const isProcessing =
                      processingId ===
                      booking.bookingId;

                    return (

                      <tr
                        key={
                          booking.bookingId
                        }
                        className="border-t border-slate-100 transition hover:bg-slate-50/70"
                      >

                        {/* Booking */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                              <CalendarDays
                                size={18}
                              />

                            </div>

                            <div>

                              <p className="font-semibold text-slate-900">
                                #
                                {
                                  booking.bookingId
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                Booking ID
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Member */}

                        <td className="px-6 py-5">

                          <div>

                            <p className="font-medium text-slate-900">
                              {booking.member
                                ?.name ||
                                `Member #${booking.memberId}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {booking.member
                                ?.email ||
                                "No email"}
                            </p>

                          </div>

                        </td>

                        {/* Facility */}

                        <td className="px-6 py-5">

                          <div>

                            <p className="font-medium text-slate-900">
                              {booking.facility
                                ?.facilityName ||
                                `Facility #${booking.facilityId}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {booking.facility
                                ?.location ||
                                "—"}
                            </p>

                          </div>

                        </td>

                        {/* Date */}

                        <td className="px-6 py-5 text-sm text-slate-700">

                          {booking.bookingDate
                            ? new Date(
                              booking.bookingDate
                            ).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                            : "—"}

                        </td>

                        {/* Time */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-700">

                            <Clock
                              size={15}
                              className="text-slate-400"
                            />

                            <span>
                              {booking.startTime ||
                                "—"}{" "}
                              -{" "}
                              {booking.endTime ||
                                "—"}
                            </span>

                          </div>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            {/* Pending */}

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    isProcessing
                                  }
                                  onClick={() =>
                                    handleConfirm(
                                      booking.bookingId
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                  <Check
                                    size={15}
                                  />

                                  {isProcessing
                                    ? "Processing..."
                                    : "Confirm"}

                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isProcessing
                                  }
                                  onClick={() =>
                                    handleCancel(
                                      booking.bookingId
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                  <X
                                    size={15}
                                  />

                                  Cancel

                                </button>
                              </>
                            )}

                            {/* Confirmed */}

                            {isConfirmed && (
                              <button
                                type="button"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleCancel(
                                    booking.bookingId
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <X
                                  size={15}
                                />

                                Cancel

                              </button>
                            )}

                            {/* Cancelled */}

                            {isCancelled && (
                              <span className="px-3 py-2 text-xs font-medium text-slate-400">
                                No actions
                              </span>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {filteredBookings.length >
          BOOKINGS_PER_PAGE && (

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Showing Count */}

              <p className="text-sm text-slate-500">

                Showing{" "}

                <span className="font-medium text-slate-700">
                  {(bookingPage - 1) *
                    BOOKINGS_PER_PAGE +
                    1}
                </span>

                {" – "}

                <span className="font-medium text-slate-700">
                  {Math.min(
                    bookingPage *
                    BOOKINGS_PER_PAGE,
                    filteredBookings.length
                  )}
                </span>

                {" of "}

                <span className="font-medium text-slate-700">
                  {filteredBookings.length}
                </span>{" "}

                bookings

              </p>

              {/* Pagination Controls */}

              <div className="flex items-center gap-2">

                {/* Previous */}

                <button
                  type="button"
                  onClick={() =>
                    setBookingPage(
                      (page) =>
                        Math.max(
                          page - 1,
                          1
                        )
                    )
                  }
                  disabled={
                    bookingPage === 1
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {/* Page Numbers */}

                <div className="flex items-center gap-1">

                  {Array.from(
                    {
                      length:
                        totalBookingPages,
                    },
                    (_, index) =>
                      index + 1
                  ).map((page) => (

                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setBookingPage(
                          page
                        )
                      }
                      className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${bookingPage === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {page}
                    </button>

                  ))}

                </div>

                {/* Next */}

                <button
                  type="button"
                  onClick={() =>
                    setBookingPage(
                      (page) =>
                        Math.min(
                          page + 1,
                          totalBookingPages
                        )
                    )
                  }
                  disabled={
                    bookingPage ===
                    totalBookingPages
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>

          )}

      </div>

    </div>
  );
}