import { Link } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";

import PublicNavbar from "../components/PublicNavbar";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />

            <main>
                <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">
                    <div className="absolute inset-0">
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
                    </div>

                    <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
                                <Trophy size={15} />
                                Community Sports Platform
                            </div>

                            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Find your game.
                                <span className="block">
                                    Book your place.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                                Discover sports facilities, explore
                                community activities, join your
                                favourite sports and book your next
                                game — all in one place.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/facilities"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
                                >
                                    Explore Facilities
                                    <ArrowRight size={17} />
                                </Link>

                                <Link
                                    to="/sports"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    Explore Sports
                                    <ArrowRight size={17} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Trophy size={21} />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Explore Sports
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Discover different sports and find
                                activities that match your interests.
                            </p>

                            <Link
                                to="/sports"
                                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Explore
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Trophy size={21} />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Find Facilities
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Find suitable sports facilities and
                                discover places to play.
                            </p>

                            <Link
                                to="/facilities"
                                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Browse facilities
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Trophy size={21} />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Join the Community
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Create an account, manage bookings
                                and connect with the sports community.
                            </p>

                            <Link
                                to="/register"
                                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Get started
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}