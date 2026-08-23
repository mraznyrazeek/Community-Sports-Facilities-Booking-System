import { useEffect, useState } from "react";

import {
  CalendarDays,
  Trash2,
} from "lucide-react";

import {
  getBookings,
  deleteBooking,
} from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

export default function Bookings() {

  const [bookings, setBookings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadBookings() {

      try {

        const data = await getBookings();

        setBookings(data || []);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    loadBookings();

  }, []);

  const cancelBooking = async (
    id: number
  ) => {

    if (
      !window.confirm(
        "Are you sure you want to cancel this booking?"
      )
    ) {
      return;
    }

    try {

      await deleteBooking(id);

      setBookings(
        bookings.filter(
          (booking) =>
            booking.bookingId !== id
        )
      );

    } catch (error: any) {

      alert(
        error?.message ||
        "Unable to cancel booking."
      );

    }

  };

  if (loading) {
    return (
      <LoadingSpinner text="Loading bookings..." />
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bookings
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor and manage facility bookings.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Booking
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Member
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Facility
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Time
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {bookings.map(
                (booking) => (

                  <tr
                    key={booking.bookingId}
                    className="border-t border-gray-100"
                  >

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                          <CalendarDays size={18} />
                        </div>

                        <span className="font-semibold">
                          #{booking.bookingId}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-5 text-sm">
                      {booking.member?.firstName ||
                        booking.memberId ||
                        "—"}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {booking.facility?.facilityName ||
                        booking.facilityId ||
                        "—"}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {booking.bookingDate
                        ? new Date(
                            booking.bookingDate
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {booking.startTime} -{" "}
                      {booking.endTime}
                    </td>

                    <td className="px-6 py-5">

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                        {booking.status ||
                          "Confirmed"}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <button
                        onClick={() =>
                          cancelBooking(
                            booking.bookingId
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}