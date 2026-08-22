import { useEffect, useState } from "react";

import FacilityCard from "../components/FacilityCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiRequest } from "../services/api";

export default function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFacilities() {
            try {
                const data = await apiRequest("/Facilities");

                setFacilities(data);
            } catch (err) {
                setError(
                    err.message || "Unable to load facilities."
                );
            } finally {
                setLoading(false);
            }
        }

        loadFacilities();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Facilities
                </h1>

                <p className="mt-2 text-gray-500">
                    Find the perfect place for your next game.
                </p>
            </div>

            {loading && <LoadingSpinner text="Loading facilities..." />}

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {!loading && !error && facilities.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                    <p className="text-gray-500">
                        No facilities are available.
                    </p>
                </div>
            )}

            {!loading && !error && facilities.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {facilities.map((facility) => (
                        <FacilityCard
                            key={facility.facilityId}
                            facility={facility}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}