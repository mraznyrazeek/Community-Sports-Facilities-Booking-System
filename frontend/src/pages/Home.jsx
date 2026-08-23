import {
    ArrowRight,
    CalendarDays,
    MapPin,
    Trophy,
    Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    const popularSports = [
        {
            name: "Football",
            description: "Find football facilities and activities.",
        },
        {
            name: "Tennis",
            description: "Book courts and enjoy your next match.",
        },
        {
            name: "Cricket",
            description: "Discover cricket grounds and activities.",
        },
        {
            name: "Badminton",
            description: "Find badminton courts near you.",
        },
    ];

    return (
        <div className="space-y-12">

            {/* HERO */}

            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl">

                <div className="relative px-8 py-16 md:px-14 md:py-24">

                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

                    <div className="absolute -bottom-32 right-20 h-80 w-80 rounded-full bg-white/10" />

                    <div className="relative max-w-3xl">

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                            <Trophy size={16} />
                            Community Sports Platform
                        </div>

                        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                            Find your game.
                            <br />
                            Book your place.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                            Discover sports facilities, explore community
                            activities, join your favourite sports and book
                            your next game — all in one place.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">

                            <button
                                onClick={() =>
                                    navigate("/facilities")
                                }
                                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
                            >
                                Explore Facilities
                                <ArrowRight size={18} />
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/sports")
                                }
                                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                Explore Sports
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* QUICK STATS */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Trophy size={21} />
                    </div>

                    <p className="mt-5 text-2xl font-bold text-gray-900">
                        Sports
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Explore different sports
                    </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <MapPin size={21} />
                    </div>

                    <p className="mt-5 text-2xl font-bold text-gray-900">
                        Facilities
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Find places to play
                    </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <CalendarDays size={21} />
                    </div>

                    <p className="mt-5 text-2xl font-bold text-gray-900">
                        Events
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Discover activities
                    </p>

                </div>


                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Users size={21} />
                    </div>

                    <p className="mt-5 text-2xl font-bold text-gray-900">
                        Community
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Connect through sport
                    </p>

                </div>

            </section>


            {/* POPULAR SPORTS */}

            <section>

                <div className="mb-6 flex items-end justify-between">

                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                            Explore
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                            Popular Sports
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Find activities and facilities for your favourite
                            sports.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/sports")}
                        className="hidden text-sm font-semibold text-blue-600 hover:text-blue-700 sm:block"
                    >
                        View all →
                    </button>

                </div>


                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {popularSports.map((sport) => (

                        <button
                            key={sport.name}
                            onClick={() =>
                                navigate("/sports")
                            }
                            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                        >

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                <Trophy size={22} />
                            </div>

                            <h3 className="mt-5 font-bold text-gray-900">
                                {sport.name}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {sport.description}
                            </p>

                            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600">
                                Explore
                                <ArrowRight size={15} />
                            </div>

                        </button>

                    ))}

                </div>

            </section>


            {/* FACILITIES */}

            <section className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MapPin size={23} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Find a place to play
                    </h2>

                    <p className="mt-3 leading-7 text-gray-500">
                        Browse our community sports facilities and find the
                        right location for your next game, training session
                        or activity.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/facilities")
                        }
                        className="mt-6 flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-600"
                    >
                        Browse Facilities
                        <ArrowRight size={17} />
                    </button>

                </div>


                <div className="rounded-3xl bg-gray-900 p-8 text-white">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
                        <CalendarDays size={23} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
                        Join the community
                    </h2>

                    <p className="mt-3 leading-7 text-gray-300">
                        Create a member account to book facilities, manage
                        your bookings and join your favourite sports.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/register")
                        }
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Become a Member
                    </button>

                </div>

            </section>


            {/* CTA */}

            <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center text-white">

                <h2 className="text-3xl font-bold">
                    Ready to get active?
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-blue-100">
                    Join the community and start discovering sports,
                    facilities and activities today.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-4">

                    <button
                        onClick={() =>
                            navigate("/register")
                        }
                        className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                        Create Account
                    </button>

                    <button
                        onClick={() =>
                            navigate("/facilities")
                        }
                        className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
                    >
                        Browse Facilities
                    </button>

                </div>

            </section>

        </div>
    );
}