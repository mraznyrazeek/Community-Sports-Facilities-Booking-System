import { useEffect, useState } from "react";

import FacilityCard from "../components/FacilityCard";
import LoadingSpinner from "../components/LoadingSpinner";
import PublicNavbar from "../components/PublicNavbar";

import { getFacilities } from "../services/api";

export default function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFacilities() {
            try {
                setLoading(true);
                setError("");

                const data = await getFacilities();

                setFacilities(
                    Array.isArray(data) ? data : []
                );
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load facilities."
                );
            } finally {
                setLoading(false);
            }
        }

        loadFacilities();
    }, []);

    return (
        <>

            <PublicNavbar />

            <main className="min-h-screen bg-gray-50">

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div className="mb-10">

                        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                            Explore
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                            Sports Facilities
                        </h1>

                        <p className="mt-3 max-w-2xl text-gray-500">
                            Discover community sports facilities and find
                            the perfect place for your next game.
                        </p>

                    </div>


                    {/* LOADING */}

                    {loading && (
                        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-gray-200 bg-white">
                            <LoadingSpinner text="Loading facilities..." />
                        </div>
                    )}


                    {/* ERROR */}

                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                            <p className="font-semibold text-red-700">
                                Unable to load facilities
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>

                        </div>
                    )}


                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        facilities.length === 0 && (

                            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">

                                <p className="text-lg font-semibold text-gray-900">
                                    No facilities available
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    There are currently no facilities to
                                    display.
                                </p>

                            </div>
                        )}


                    {/* FACILITIES */}

                    {!loading &&
                        !error &&
                        facilities.length > 0 && (

                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                                {facilities.map(
                                    (facility) => (
                                        <FacilityCard
                                            key={
                                                facility.facilityId
                                            }
                                            facility={
                                                facility
                                            }
                                        />
                                    )
                                )}

                            </div>
                        )}

                </div>

            </main>

        </>
    );
}