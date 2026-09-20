import { useEffect, useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    MapPin,
    Search,
    ShieldCheck,
    Trophy,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../components/navigation/PublicNavbar";
import CustomerNavbar from "../components/navigation/CustomerNavbar";

import {
    getCurrentMember,
    getSports,
} from "../services/api";

interface Sport {
    sportId: number;
    sportName: string;
    description?: string;
}

export default function Home() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loadingSports, setLoadingSports] = useState(true);

    // CURRENT MEMBER / NAVBAR
    const member = getCurrentMember();

    const isLoggedInMember =
        !!localStorage.getItem("token") &&
        member?.role?.toLowerCase() === "member";

    // LOAD SPORTS
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
        <div className="min-h-screen bg-white text-slate-900">

            {/* NAVBAR*/}

            {isLoggedInMember ? (
                <CustomerNavbar />
            ) : (
                <PublicNavbar />
            )}

            {/* HERO */}

            <section className="relative overflow-hidden bg-slate-950">

                {/* Background decoration */}

                <div className="pointer-events-none absolute inset-0">

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

                    <div className="absolute right-0 top-20 h-[32rem] w-[32rem] rounded-full bg-indigo-600/20 blur-3xl" />

                    <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />

                </div>

                <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">

                    <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">

                        {/* LEFT */}

                        <div>

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">

                                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />

                                Community sports, made simple

                            </div>

                            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">

                                Find your game.

                                <span className="mt-2 block bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                                    Find your community.
                                </span>

                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">

                                Discover local sports facilities, explore your
                                favourite activities and book your next game
                                from one simple community platform.

                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                                <Link
                                    to="/facilities"
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25"
                                >

                                    Find a Facility

                                    <ArrowRight
                                        size={17}
                                        className="transition-transform group-hover:translate-x-1"
                                    />

                                </Link>

                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                                >
                                    Become a Member
                                </Link>

                            </div>

                            {/* Trust points */}

                            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">

                                <div className="flex items-center gap-2">

                                    <CheckCircle2
                                        size={16}
                                        className="text-emerald-400"
                                    />

                                    Easy facility discovery

                                </div>

                                <div className="flex items-center gap-2">

                                    <CheckCircle2
                                        size={16}
                                        className="text-emerald-400"
                                    />

                                    Simple online booking

                                </div>

                            </div>

                        </div>

                        {/*  RIGHT - SEARCH CARD */}

                        <div className="relative">

                            <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-2xl" />

                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-6">

                                <div className="mb-6">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                                            <Search size={21} />

                                        </div>

                                        <div>

                                            <h2 className="font-semibold text-white">
                                                Find a place to play
                                            </h2>

                                            <p className="mt-0.5 text-sm text-slate-400">
                                                Discover available facilities
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="space-y-3">

                                    <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                                        <div className="flex items-center gap-3">

                                            <Trophy
                                                size={18}
                                                className="text-blue-300"
                                            />

                                            <div>

                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Sport
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-white">
                                                    Tennis, football, basketball...
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                                            <div className="flex items-center gap-3">

                                                <MapPin
                                                    size={18}
                                                    className="text-cyan-300"
                                                />

                                                <div className="min-w-0">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                        Location
                                                    </p>

                                                    <p className="mt-1 truncate text-sm font-medium text-white">
                                                        Nearby facilities
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                                            <div className="flex items-center gap-3">

                                                <CalendarDays
                                                    size={18}
                                                    className="text-indigo-300"
                                                />

                                                <div>

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                        Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-white">
                                                        Choose a date
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-black/10 p-4">

                                        <div className="flex items-center gap-3">

                                            <Clock3
                                                size={18}
                                                className="text-violet-300"
                                            />

                                            <div>

                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Availability
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-white">
                                                    Find a suitable time
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <Link
                                    to="/facilities"
                                    className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-blue-50"
                                >

                                    Explore Facilities

                                    <ChevronRight
                                        size={17}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />

                                </Link>

                                <p className="mt-4 text-center text-xs text-slate-500">
                                    Browse first. Sign in when you're ready to book.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* QUICK DISCOVERY*/}

            <section className="border-b border-slate-100 bg-slate-50">

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <Link
                            to="/sports"
                            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                        >

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Trophy size={21} />
                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="font-semibold text-slate-900">
                                    Explore Sports
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Discover available activities
                                </p>

                            </div>

                            <ArrowRight
                                size={18}
                                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                            />

                        </Link>

                        <Link
                            to="/facilities"
                            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                        >

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <MapPin size={21} />
                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="font-semibold text-slate-900">
                                    Browse Facilities
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Find somewhere to play
                                </p>

                            </div>

                            <ArrowRight
                                size={18}
                                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                            />

                        </Link>

                        <Link
                            to="/register"
                            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                        >

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Users size={21} />
                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="font-semibold text-slate-900">
                                    Become a Member
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Join the sports community
                                </p>

                            </div>

                            <ArrowRight
                                size={18}
                                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                            />

                        </Link>

                    </div>

                </div>

            </section>

            {/* SPORTS */}

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div className="max-w-2xl">

                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                            Discover
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Find a sport you enjoy
                        </h2>

                        <p className="mt-3 text-base leading-7 text-slate-500">
                            Explore the sports available through your community
                            and find new ways to stay active.
                        </p>

                    </div>

                    <Link
                        to="/sports"
                        className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-blue-600"
                    >

                        View all sports

                        <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                        />

                    </Link>

                </div>

                <div className="mt-9">

                    {loadingSports ? (

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            {[1, 2, 3, 4].map((item) => (

                                <div
                                    key={item}
                                    className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                                />

                            ))}

                        </div>

                    ) : featuredSports.length > 0 ? (

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            {featuredSports.map((sport) => (

                                <Link
                                    key={sport.sportId}
                                    to="/sports"
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                                >

                                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-blue-50 opacity-0 blur-2xl transition group-hover:opacity-100" />

                                    <div className="relative">

                                        <div className="flex items-start justify-between">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                                <Trophy size={21} />
                                            </div>

                                            <ArrowRight
                                                size={18}
                                                className="text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
                                            />

                                        </div>

                                        <h3 className="mt-6 truncate text-lg font-bold text-slate-950">
                                            {sport.sportName}
                                        </h3>

                                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                                            {sport.description ||
                                                "Explore this sport and discover available activities."}
                                        </p>

                                        <div className="mt-6 text-sm font-semibold text-blue-600">
                                            Explore sport
                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    ) : (

                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                                <Trophy size={27} />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                No sports available yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Sports will appear here once they are added to
                                the community platform.
                            </p>

                        </div>

                    )}

                </div>

            </section>

           
            {/* MEMBER BENEFITS */}

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

                <div className="grid items-center gap-12 lg:grid-cols-2">

                    <div>

                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                            Built for the community
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            More than just a booking system
                        </h2>

                        <div className="mt-8 space-y-5">

                            <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <CalendarDays size={19} />
                                </div>

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Manage your bookings
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Keep track of your upcoming facility
                                        bookings from your member account.
                                    </p>

                                </div>

                            </div>

                            <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={19} />
                                </div>

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        A simple member experience
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Access your sports, bookings and
                                        community activities from one place.
                                    </p>

                                </div>

                            </div>

                            <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                    <Users size={19} />
                                </div>

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Be part of the community
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Join your favourite sports and share
                                        your experience with the community.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* DARK CARD */}

                    <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-10">

                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

                        <div className="relative">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                                <Trophy size={22} />
                            </div>

                            <h3 className="mt-7 text-2xl font-bold text-white">
                                Ready to join?
                            </h3>

                            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                                Create your member account and get access to
                                facility bookings, your favourite sports and
                                your personal activity history.
                            </p>

                            <Link
                                to="/register"
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                Become a Member

                                <ArrowRight size={17} />
                            </Link>

                            <p className="mt-4 text-xs text-slate-500">

                                Already a member?{" "}

                                <Link
                                    to="/login"
                                    className="font-semibold text-blue-400 hover:text-blue-300"
                                >
                                    Sign in
                                </Link>

                            </p>

                        </div>

                    </div>

                </div>

            </section>

            {/* FINAL CTA */}

            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600">

                <div className="pointer-events-none absolute inset-0">

                    <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                </div>

                <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">

                 

                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Your next game starts here.
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-blue-100">
                        Explore local facilities, discover new sports and join
                        the community today.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                        <Link
                            to="/facilities"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
                        >

                            Explore Facilities

                            <ArrowRight size={17} />

                        </Link>

                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                        >
                            Become a Member
                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}