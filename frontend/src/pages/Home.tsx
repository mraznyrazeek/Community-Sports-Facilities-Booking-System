import { useEffect, useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    MapPin,
    Trophy,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../components/PublicNavbar";
import { getSports } from "../services/api";

export default function Home() {
    const [sports, setSports] = useState<any[]>([]);
    const [loadingSports, setLoadingSports] = useState(true);

    useEffect(() => {
        const loadSports = async () => {
            try {
                const data = await getSports();

                setSports(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch {
                setSports([]);
            } finally {
                setLoadingSports(false);
            }
        };

        loadSports();
    }, []);

    const featuredSports = sports.slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50">

            <PublicNavbar />

            {/* ==================================================
                HERO
            ================================================== */}

            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">

                    <div className="max-w-3xl">

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                            <Trophy size={16} />

                            Community Sports Platform
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Find your game.
                            <span className="block">
                                Book your place.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                            Discover sports facilities, explore community
                            activities, join your favourite sports and book
                            your next game — all in one place.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/facilities"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                                Explore Facilities

                                <ArrowRight size={17} />
                            </Link>

                            <Link
                                to="/sports"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                Explore Sports
                            </Link>

                        </div>

                    </div>

                </div>

            </section>

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* SPORTS */}

                    <Link
                        to="/sports"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Trophy size={21} />
                        </div>

                        <h2 className="font-semibold text-slate-900">
                            Sports
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Explore available sports.
                        </p>

                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            Explore

                            <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1"
                            />
                        </span>
                    </Link>

                    {/* FACILITIES */}

                    <Link
                        to="/facilities"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <MapPin size={21} />
                        </div>

                        <h2 className="font-semibold text-slate-900">
                            Facilities
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Find places to play.
                        </p>

                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            Explore

                            <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1"
                            />
                        </span>
                    </Link>

                    {/* ACTIVITIES */}

                    <Link
                        to="/sports"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <CalendarDays size={21} />
                        </div>

                        <h2 className="font-semibold text-slate-900">
                            Activities
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Discover sporting activities.
                        </p>

                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            Explore

                            <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1"
                            />
                        </span>
                    </Link>

                    {/* COMMUNITY */}

                    <Link
                        to="/login"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <Users size={21} />
                        </div>

                        <h2 className="font-semibold text-slate-900">
                            Community
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Connect through sport.
                        </p>

                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            Member Login

                            <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1"
                            />
                        </span>
                    </Link>

                </div>

            </section>

            {/* ==================================================
                POPULAR SPORTS
            ================================================== */}

            <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <p className="text-sm font-semibold text-blue-600">
                            Explore
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Popular Sports
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Discover the sports available in your community.
                        </p>

                    </div>

                    <Link
                        to="/sports"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        View all sports

                        <ArrowRight size={16} />
                    </Link>

                </div>

                {/* LOADING */}

                {loadingSports ? (

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
                            />
                        ))}

                    </div>

                ) : featuredSports.length > 0 ? (

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {featuredSports.map((sport) => (

                            <Link
                                key={sport.sportId}
                                to="/sports"
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                            >

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                    <Trophy size={22} />
                                </div>

                                <h3 className="mt-5 truncate text-lg font-bold text-slate-900">
                                    {sport.sportName}
                                </h3>

                                <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                                    {sport.description ||
                                        "Explore this sport and discover available activities."}
                                </p>

                                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                                    Explore

                                    <ArrowRight
                                        size={15}
                                        className="transition group-hover:translate-x-1"
                                    />
                                </div>

                            </Link>

                        ))}

                    </div>

                ) : (

                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">

                        <Trophy
                            size={32}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                            No sports available
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Sports will appear here once they are added.
                        </p>

                    </div>

                )}

            </section>

            {/* ==================================================
                FACILITY / COMMUNITY
            ================================================== */}

            <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                    {/* FACILITIES */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-2">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <MapPin size={21} />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            Find a place to play
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Browse our community sports facilities and find
                            the right location for your next game, training
                            session or activity.
                        </p>

                        <Link
                            to="/facilities"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Browse Facilities

                            <ArrowRight size={16} />
                        </Link>

                    </div>

                    {/* MEMBER */}

                    <div className="rounded-2xl bg-slate-900 p-7">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                            <Users size={21} />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-white">
                            Join the community
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Access your member account to book facilities,
                            manage your bookings and join your favourite
                            sports.
                        </p>

                        <Link
                            to="/login"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Member Login

                            <ArrowRight size={16} />
                        </Link>

                    </div>

                </div>

            </section>

            {/* ==================================================
                CTA
            ================================================== */}

            <section className="bg-gradient-to-r from-blue-600 to-indigo-600">

                <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">

                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        Ready to get active?
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100">
                        Discover sports, explore facilities and manage your
                        activities from one simple platform.
                    </p>

                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                        <Link
                            to="/facilities"
                            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Browse Facilities
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Member Login
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}