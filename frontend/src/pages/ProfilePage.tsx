import {
    ArrowRight,
    CalendarDays,
    MessageSquare,
    Star,
    Trophy,
} from "lucide-react";

import { Link } from "react-router-dom";
import { getCurrentMember } from "../services/api";

export default function ProfilePage() {
    const member = getCurrentMember();

    const memberName =
        member?.firstName ||
        member?.name ||
        member?.fullName ||
        "Member";

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <p className="text-sm font-semibold text-blue-600">
                        Member Area
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        My Profile
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Welcome back, {memberName}.
                        Manage your bookings, sports, reviews and inquiries.
                    </p>

                </div>
            </section>


            {/* =====================================================
                PROFILE CONTENT
            ===================================================== */}

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">


                    {/* =================================================
                        MY BOOKINGS
                    ================================================= */}

                    <Link
                        to="/profile/bookings"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <CalendarDays size={23} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            My Bookings
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            View and manage your facility bookings.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                            View bookings
                            <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                            />
                        </div>

                    </Link>


                    {/* =================================================
                        REGISTERED SPORTS
                    ================================================= */}

                    <Link
                        to="/profile/sports"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Trophy size={23} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            Registered Sports
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            View the sports you have registered for.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                            View sports
                            <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                            />
                        </div>

                    </Link>


                    {/* =================================================
                        MY REVIEWS
                    ================================================= */}

                    <Link
                        to="/profile/reviews"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <Star size={23} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            My Reviews
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            View the reviews you have submitted.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-purple-600">
                            View reviews
                            <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                            />
                        </div>

                    </Link>


                    {/* =================================================
                        MY INQUIRIES
                    ================================================= */}

                    <Link
                        to="/profile/inquiries"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <MessageSquare size={23} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-slate-900">
                            My Inquiries
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            View your submitted inquiries.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                            View inquiries
                            <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                            />
                        </div>

                    </Link>

                </div>


                {/* =====================================================
                    ACCOUNT INFORMATION
                ===================================================== */}

                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <p className="text-sm font-semibold text-slate-900">
                                Account
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                You are signed in as{" "}
                                <span className="font-medium text-slate-700">
                                    {memberName}
                                </span>
                            </p>

                        </div>

                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to Home
                        </Link>

                    </div>

                </section>

            </main>

        </div>
    );
}