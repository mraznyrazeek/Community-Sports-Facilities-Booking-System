import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiRequest } from "../services/api";

export default function Sports() {
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSports() {
            try {
                const data = await apiRequest("/Sports");
                setSports(data);
            } finally {
                setLoading(false);
            }
        }

        loadSports();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Sports
                </h1>

                <p className="mt-2 text-gray-500">
                    Explore the sports available in your community.
                </p>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading sports..." />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {sports.map((sport) => (
                        <div
                            key={sport.sportId}
                            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Trophy size={24} />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-gray-900">
                                {sport.sportName}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {sport.description ||
                                    "Explore this sport and find available facilities."}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}