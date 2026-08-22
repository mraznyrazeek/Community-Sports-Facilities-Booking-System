import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import LoadingSpinner from "../components/LoadingSpinner";
import { apiRequest } from "../services/api";

export default function MySports() {
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMySports() {
            try {
                const data = await apiRequest("/MemberSports");

                setSports(data);
            } finally {
                setLoading(false);
            }
        }

        loadMySports();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    My Sports
                </h1>

                <p className="mt-2 text-gray-500">
                    Sports you are currently registered for.
                </p>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading your sports..." />
            ) : sports.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                    <Trophy
                        size={45}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-5 font-semibold text-gray-900">
                        No sports registered
                    </h2>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {sports.map((item) => (
                        <div
                            key={item.sportId}
                            className="rounded-2xl border border-gray-200 bg-white p-6"
                        >
                            <Trophy className="text-blue-600" />

                            <h2 className="mt-4 text-xl font-bold">
                                {item.sport?.sportName}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {item.sport?.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}