import { useEffect, useState } from "react";
import {
    ArrowRight,
    Search,
    Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getSports } from "../services/api";

export default function Sports() {
    const [sports, setSports] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSports = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSports();

                setSports(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(
                    err?.message || "Unable to load sports."
                );
            } finally {
                setLoading(false);
            }
        };

        loadSports();
    }, []);

    const filteredSports = sports.filter((sport) => {
        const name = sport?.name || sport?.sportName || "";
        const description = sport?.description || "";

        const searchText = search.toLowerCase();

        return (
            name.toLowerCase().includes(searchText) ||
            description.toLowerCase().includes(searchText)
        );
    });

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                <Trophy size={14} />
                                Sports
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Explore Sports
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Discover sports available in our community
                                and find activities that match your interests.
                            </p>
                        </div>

                        <div className="relative w-full lg:w-80">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search sports..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {loading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                            >
                                <div className="h-12 w-12 rounded-xl bg-slate-200" />

                                <div className="mt-5 h-5 w-32 rounded bg-slate-200" />

                                <div className="mt-3 h-4 w-full rounded bg-slate-200" />

                                <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />

                                <div className="mt-6 h-4 w-20 rounded bg-slate-200" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm font-semibold text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredSports.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredSports.map((sport) => {
                                const id =
                                    sport?.id ||
                                    sport?.sportId;

                                const name =
                                    sport?.name ||
                                    sport?.sportName ||
                                    "Sport";

                                const description =
                                    sport?.description ||
                                    "Explore this sport and discover available activities.";

                                return (
                                    <div
                                        key={id || name}
                                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <Trophy size={22} />
                                            </div>
                                        </div>

                                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                                            {name}
                                        </h2>

                                        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                                            {description}
                                        </p>

                                        <Link
                                            to="/facilities"
                                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                        >
                                            Find Facilities
                                            <ArrowRight
                                                size={16}
                                                className="transition group-hover:translate-x-1"
                                            />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredSports.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Search size={24} />
                            </div>

                            <h2 className="mt-5 text-lg font-bold text-slate-900">
                                No sports found
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Try searching with a different sport name.
                            </p>
                        </div>
                    )}
            </section>
        </main>
    );
}