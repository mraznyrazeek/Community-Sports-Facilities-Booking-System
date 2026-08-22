import { CalendarDays } from "lucide-react";

export default function MyBookings() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    My Bookings
                </h1>

                <p className="mt-2 text-gray-500">
                    View and manage your facility bookings.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                <CalendarDays
                    size={45}
                    className="mx-auto text-gray-300"
                />

                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                    No bookings yet
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Your bookings will appear here once you make
                    one.
                </p>
            </div>
        </div>
    );
}