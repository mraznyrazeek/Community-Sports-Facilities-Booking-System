import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    Search,
    Trophy,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getSports } from "../services/api";

// ============================================================
// TYPES
// ============================================================

interface Sport {
    id?: number;
    sportId?: number;
    name?: string;
    sportName?: string;
    description?: string;
}

// ============================================================
// PAGE
// ============================================================

export default function Sports() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ========================================================
    // LOAD SPORTS
    // ========================================================

    useEffect(() => {
        const loadSports = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSports();

                if (Array.isArray(data)) {
                    setSports(data as Sport[]);
                } else {
                    setSports([]);
                }
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load sports."
                );

                setSports([]);
            } finally {
                setLoading(false);
            }
        };

        loadSports();
    }, []);

    // ========================================================
    // FILTER SPORTS
    // ========================================================

    const filteredSports = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) {
            return sports;
        }

        return sports.filter((sport) => {
            const name =
                sport.name ||
                sport.sportName ||
                "";

            const description =
                sport.description ||
                "";

            return (
                name.toLowerCase().includes(searchText) ||
                description.toLowerCase().includes(searchText)
            );
        });
    }, [sports, search]);

    // ========================================================
    // CLEAR SEARCH
    // ========================================================

    const clearSearch = () => {
        setSearch("");
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <main className="min-h-screen bg-slate-50">

            {/* ==================================================
                HERO
            ================================================== */}

            <section className="relative overflow-hidden border-b border-slate-200 bg-white">

                {/* Background decoration */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

                    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">

                        {/* Heading */}
                        <div>

                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600">
                                <Trophy size={14} />
                                Community Sports
                            </div>

                            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                                Find your{" "}
                                <span className="text-blue-600">
                                    sport.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                                Explore the sports available in our
                                community and discover activities that
                                match your interests.
                            </p>

                        </div>

                        {/* Search */}
                        <div>

                            <label
                                htmlFor="sport-search"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Search sports
                            </label>

                            <div className="relative">

                                <Search
                                    size={19}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="sport-search"
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search by sport name..."
                                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Clear search"
                                    >
                                        <X size={17} />
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                {/* Results header */}
                {!loading && !error && (
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Available Sports
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {search
                                    ? `${filteredSports.length} result${
                                          filteredSports.length !== 1
                                              ? "s"
                                              : ""
                                      } found`
                                    : `${sports.length} sport${
                                          sports.length !== 1
                                              ? "s"
                                              : ""
                                      } available`}
                            </p>
                        </div>

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:self-auto"
                            >
                                Clear search
                            </button>
                        )}

                    </div>
                )}

                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />

                                    <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />

                                </div>

                                <div className="mt-6 h-6 w-36 animate-pulse rounded-lg bg-slate-200" />

                                <div className="mt-4 space-y-2">

                                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                                    <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />

                                </div>

                                <div className="mt-7 h-10 w-32 animate-pulse rounded-xl bg-slate-100" />

                            </div>
                        ))}

                    </div>
                )}

                {/* ==================================================
                    ERROR
                ================================================== */}

                {!loading && error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                            <Trophy size={24} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-red-900">
                            Unable to load sports
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* ==================================================
                    SPORTS GRID
                ================================================== */}

                {!loading &&
                    !error &&
                    filteredSports.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {filteredSports.map((sport, index) => {

                                const id =
                                    sport.id ??
                                    sport.sportId ??
                                    index;

                                const name =
                                    sport.name ||
                                    sport.sportName ||
                                    "Sport";

                                const description =
                                    sport.description ||
                                    "Explore this sport and discover available activities.";

                                return (
                                    <article
                                        key={`${id}-${name}`}
                                        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
                                    >

                                        {/* Top accent */}
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition group-hover:opacity-100" />

                                        {/* Card header */}
                                        <div className="flex items-start justify-between">

                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition duration-300 group-hover:bg-blue-600 group-hover:text-white">

                                                <Trophy size={24} />

                                            </div>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                                Sport
                                            </span>

                                        </div>

                                        {/* Name */}
                                        <h2 className="mt-6 text-xl font-extrabold tracking-tight text-slate-900">
                                            {name}
                                        </h2>

                                        {/* Description */}
                                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                                            {description}
                                        </p>

                                        {/* Action */}
                                        <Link
                                            to="/facilities"
                                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition group-hover:bg-blue-600 group-hover:text-white"
                                        >
                                            Find Facilities

                                            <ArrowRight
                                                size={16}
                                                className="transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </Link>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!loading &&
                    !error &&
                    filteredSports.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Search size={27} />
                            </div>

                            <h2 className="mt-6 text-xl font-extrabold text-slate-900">
                                No sports found
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                We couldn't find any sports matching{" "}
                                <span className="font-semibold text-slate-700">
                                    "{search}"
                                </span>
                                .
                            </p>

                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                            >
                                Clear Search
                            </button>

                        </div>
                    )}

            </section>

            {/* ==================================================
                BOTTOM CTA
            ================================================== */}

            {!loading && !error && sports.length > 0 && (
                <section className="border-t border-slate-200 bg-white">

                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

                            <div className="px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-12">

                                <div className="max-w-2xl">

                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                                        <Trophy size={21} />
                                    </div>

                                    <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                        Found your sport?
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                                        Find a facility near you and book
                                        your next sporting activity.
                                    </p>

                                </div>

                                <Link
                                    to="/facilities"
                                    className="mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50 lg:mt-0"
                                >
                                    Browse Facilities
                                    <ArrowRight size={17} />
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>
            )}

        </main>
    );
}