import {
    CalendarCheck,
    Building2,
    Trophy,
    Star,
    ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Dashboard() {
    const member = JSON.parse(
        localStorage.getItem("member") || "null"
    );

    const stats = [
        {
            title: "My Bookings",
            value: "0",
            icon: CalendarCheck,
            path: "/bookings",
        },
        {
            title: "Facilities",
            value: "Browse",
            icon: Building2,
            path: "/facilities",
        },
        {
            title: "My Sports",
            value: "0",
            icon: Trophy,
            path: "/my-sports",
        },
        {
            title: "Reviews",
            value: "0",
            icon: Star,
            path: "/reviews",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <section>
                <p className="text-sm font-medium text-blue-600">
                    Welcome back
                </p>

                <h1 className="mt-1 text-3xl font-bold text-gray-900">
                    {member?.name || "Member"} 👋
                </h1>

                <p className="mt-2 text-gray-500">
                    Find a facility and get your next game started.
                </p>
            </section>

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <div className="relative z-10 max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                        Community Sports
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                        Ready for your next game?
                    </h2>

                    <p className="mt-4 text-blue-100">
                        Discover available sports facilities near
                        you and book your preferred time.
                    </p>

                    <Link
                        to="/facilities"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                        Explore Facilities
                        <ArrowRight size={17} />
                    </Link>
                </div>

                <div className="absolute -right-8 -top-8 text-[160px] opacity-10">
                    🏟️
                </div>
            </section>

            {/* Stats */}
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Link
                            key={stat.title}
                            to={stat.path}
                            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                    <Icon size={21} />
                                </div>

                                <ArrowRight
                                    size={18}
                                    className="text-gray-300"
                                />
                            </div>

                            <p className="mt-5 text-sm text-gray-500">
                                {stat.title}
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                        </Link>
                    );
                })}
            </section>

            {/* Quick actions */}
            <section>
                <h2 className="text-xl font-bold text-gray-900">
                    Quick Actions
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <Link
                        to="/facilities"
                        className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-300"
                    >
                        <Building2 className="text-blue-600" />
                        <h3 className="mt-4 font-semibold">
                            Find a Facility
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Browse available facilities.
                        </p>
                    </Link>

                    <Link
                        to="/sports"
                        className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-300"
                    >
                        <Trophy className="text-blue-600" />
                        <h3 className="mt-4 font-semibold">
                            Explore Sports
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Discover available sports.
                        </p>
                    </Link>

                    <Link
                        to="/bookings"
                        className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-300"
                    >
                        <CalendarCheck className="text-blue-600" />
                        <h3 className="mt-4 font-semibold">
                            My Bookings
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            View your upcoming bookings.
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    );
}