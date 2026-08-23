import { useEffect, useState } from "react";

import {
    ArrowLeft,
    CalendarDays,
    Clock,
    MapPin,
    Trophy,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner";
import PublicNavbar from "../components/PublicNavbar";

import { getFacility } from "../services/api";

export default function FacilityDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [facility, setFacility] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        async function loadFacility() {

            try {

                setLoading(true);
                setError("");

                const data = await getFacility(id);

                setFacility(data);

            } catch (err) {

                setError(
                    err.message ||
                    "Unable to load facility."
                );

            } finally {

                setLoading(false);

            }
        }

        if (id) {
            loadFacility();
        }

    }, [id]);


    return (
        <>

            <PublicNavbar />

            <main className="min-h-screen bg-gray-50">

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* LOADING */}

                    {loading && (

                        <div className="flex min-h-[500px] items-center justify-center">

                            <LoadingSpinner
                                text="Loading facility..."
                            />

                        </div>

                    )}


                    {/* ERROR */}

                    {!loading && error && (

                        <div className="rounded-3xl border border-red-200 bg-red-50 p-8">

                            <h2 className="font-bold text-red-700">
                                Unable to load facility
                            </h2>

                            <p className="mt-2 text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/facilities"
                                    )
                                }
                                className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
                            >
                                Back to Facilities
                            </button>

                        </div>

                    )}


                    {/* NOT FOUND */}

                    {!loading &&
                        !error &&
                        !facility && (

                            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">

                                <h2 className="text-xl font-bold text-gray-900">
                                    Facility not found
                                </h2>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/facilities"
                                        )
                                    }
                                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                                >
                                    Back to Facilities
                                </button>

                            </div>
                        )}


                    {/* FACILITY */}

                    {!loading &&
                        !error &&
                        facility && (

                            <div className="space-y-7">

                                {/* BACK */}

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/facilities"
                                        )
                                    }
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
                                >
                                    <ArrowLeft
                                        size={18}
                                    />
                                    Back to Facilities
                                </button>


                                {/* HERO */}

                                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl">

                                    <div className="relative p-8 md:p-12">

                                        <div className="absolute right-8 top-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-white/30">
                                            <Trophy
                                                size={55}
                                            />
                                        </div>


                                        <div className="relative max-w-3xl">

                                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                                                <Trophy
                                                    size={17}
                                                />

                                                {facility
                                                    .sport
                                                    ?.sportName ||
                                                    "Sports Facility"}
                                            </div>


                                            <h1 className="text-3xl font-bold md:text-5xl">
                                                {
                                                    facility.facilityName
                                                }
                                            </h1>


                                            <p className="mt-5 max-w-2xl leading-7 text-blue-100">
                                                {facility.description ||
                                                    "A community sports facility available for local activities and bookings."}
                                            </p>


                                            <div className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                                                {facility.status ||
                                                    "Available"}
                                            </div>

                                        </div>

                                    </div>

                                </section>


                                {/* INFORMATION */}

                                <div className="grid gap-6 lg:grid-cols-2">


                                    {/* DETAILS */}

                                    <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

                                        <h2 className="text-xl font-bold text-gray-900">
                                            Facility Information
                                        </h2>

                                        <div className="mt-7 space-y-6">


                                            {/* LOCATION */}

                                            <div className="flex items-start gap-4">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                    <MapPin
                                                        size={21}
                                                    />
                                                </div>

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                        Location
                                                    </p>

                                                    <p className="mt-1 font-semibold text-gray-900">
                                                        {facility.location ||
                                                            "Not available"}
                                                    </p>

                                                    {facility.address && (
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {
                                                                facility.address
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>


                                            {/* HOURS */}

                                            <div className="flex items-start gap-4">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                    <Clock
                                                        size={21}
                                                    />
                                                </div>

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                        Opening Hours
                                                    </p>

                                                    <p className="mt-1 font-semibold text-gray-900">
                                                        {facility.openingTime ||
                                                            "--"}
                                                        {" - "}
                                                        {facility.closingTime ||
                                                            "--"}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* SPORT */}

                                            <div className="flex items-start gap-4">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                    <Trophy
                                                        size={21}
                                                    />
                                                </div>

                                                <div>

                                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                        Sport
                                                    </p>

                                                    <p className="mt-1 font-semibold text-gray-900">
                                                        {facility
                                                            .sport
                                                            ?.sportName ||
                                                            "Not available"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </section>


                                    {/* BOOKING */}

                                    <section className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <CalendarDays
                                                size={24}
                                            />
                                        </div>

                                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                            Ready to play?
                                        </h2>

                                        <p className="mt-3 leading-7 text-gray-500">
                                            Check availability and
                                            book this facility for
                                            your next game.
                                        </p>


                                        <div className="mt-7 rounded-2xl bg-gray-50 p-5">

                                            <p className="font-semibold text-gray-900">
                                                Book this facility
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Choose your preferred
                                                date and time.
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/bookings?facilityId=${facility.facilityId}`
                                                    )
                                                }
                                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                                            >
                                                <CalendarDays
                                                    size={18}
                                                />

                                                Book Facility
                                            </button>

                                        </div>

                                    </section>

                                </div>

                            </div>

                        )}

                </div>

            </main>

        </>
    );
}