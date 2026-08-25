import {
    ArrowRight,
    CalendarDays,
    MapPin,
    Trophy,
    Users,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50">
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

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                    <Link
                        to="/register"
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
                            Join
                            <ArrowRight
                                size={15}
                                className="transition group-hover:translate-x-1"
                            />
                        </span>
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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

                    <div className="rounded-2xl bg-slate-900 p-7">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                            <Users size={21} />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-white">
                            Join the community
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Create a member account to book facilities,
                            manage your bookings and join your favourite
                            sports.
                        </p>

                        <Link
                            to="/register"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Become a Member
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        Ready to get active?
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100">
                        Join the community and start discovering sports,
                        facilities and activities today.
                    </p>

                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            to="/register"
                            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Create Account
                        </Link>

                        <Link
                            to="/facilities"
                            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Browse Facilities
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}