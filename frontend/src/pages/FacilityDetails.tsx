import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Trophy,
} from "lucide-react";

import PublicNavbar from "../components/navigation/PublicNavbar";
import CustomerNavbar from "../components/navigation/CustomerNavbar";

import {
    getCurrentMember,
    getFacility,
} from "../services/api";

interface Sport {
    sportId: number;
    sportName: string;
    description?: string;
}

interface Facility {
    facilityId: number;
    sportId: number;
    facilityName: string;
    description?: string;
    location?: string;
    address?: string;
    openingTime?: string;
    closingTime?: string;
    status?: string;
    sport?: Sport;
}

export default function FacilityDetails() {
    const { id } = useParams<{ id: string }>();

    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Current Member
    |--------------------------------------------------------------------------
    */

    const member = getCurrentMember();

    const isLoggedInMember =
        !!localStorage.getItem("token") &&
        member?.role?.toLowerCase() === "member";

    /*
    |--------------------------------------------------------------------------
    | Load Facility
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const loadFacility = async () => {
            if (!id) {
                setError("Facility not found.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getFacility(id);

                setFacility(data);
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load facility."
                );
            } finally {
                setLoading(false);
            }
        };

        loadFacility();
    }, [id]);

    /*
    |--------------------------------------------------------------------------
    | Format Time
    |--------------------------------------------------------------------------
    */

    const formatTime = (time?: string) => {
        if (!time) {
            return "--";
        }

        const value = String(time).substring(0, 5);

        const [hours, minutes] = value.split(":");

        const hour = Number(hours);

        if (Number.isNaN(hour)) {
            return value;
        }

        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Facility Status
    |--------------------------------------------------------------------------
    */

    const isActive =
        String(facility?.status || "")
            .toLowerCase()
            .trim() === "active";

    /*
    |--------------------------------------------------------------------------
    | Navbar
    |--------------------------------------------------------------------------
    */

    const Navbar = () => {
        return isLoggedInMember ? (
            <CustomerNavbar />
        ) : (
            <PublicNavbar />
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Loading breadcrumb */}
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

                    {/* Loading card */}
                    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                        {/* Hero */}
                        <div className="h-[280px] animate-pulse bg-slate-200 sm:h-[360px]" />

                        {/* Content */}
                        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">

                            <div className="space-y-4 lg:col-span-2">
                                <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />

                                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />

                                <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-200" />
                            </div>

                            <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error State
    |--------------------------------------------------------------------------
    */

    if (error || !facility) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />

                <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">

                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        {/* Error Icon */}
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <MapPin size={28} />
                        </div>

                        {/* Title */}
                        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                            Facility not found
                        </h1>

                        {/* Message */}
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            {error ||
                                "The facility you are looking for could not be found or may no longer be available."}
                        </p>

                        {/* Back button */}
                        <Link
                            to="/facilities"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <ArrowLeft size={17} />
                            Back to Facilities
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Facility Details
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-slate-50">

            {/* NAVBAR */}

            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

                {/* BACK NAVIGATION */}

                <div className="mb-6">
                    <Link
                        to="/facilities"
                        className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-blue-600"
                    >
                        <ArrowLeft
                            size={17}
                            className="transition-transform group-hover:-translate-x-0.5"
                        />

                        Back to Facilities
                    </Link>
                </div>

                {/* MAIN CARD */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    {/* HERO */}

                    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

                        {/* Decorative circles */}

                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

                        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                        <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

                        {/* Hero Content */}

                        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">

                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                                {/* Left */}

                                <div className="max-w-3xl">

                                    {/* Sport Badge */}

                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                                        <Trophy size={15} />

                                        {facility.sport?.sportName ||
                                            "Sports Facility"}
                                    </div>

                                    {/* Facility Name */}

                                    <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                        {facility.facilityName}
                                    </h1>

                                    {/* Location */}

                                    {facility.location && (
                                        <div className="mt-5 flex items-center gap-2 text-sm text-blue-100 sm:text-base">
                                            <MapPin
                                                size={18}
                                                className="shrink-0"
                                            />

                                            <span>
                                                {facility.location}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Status */}

                                <div className="shrink-0">
                                    <div
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md ${
                                            isActive
                                                ? "border-emerald-300/30 bg-emerald-500/20 text-emerald-50"
                                                : "border-white/20 bg-white/10 text-white"
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                isActive
                                                    ? "bg-emerald-300"
                                                    : "bg-slate-300"
                                            }`}
                                        />

                                        {facility.status ||
                                            "Status unavailable"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CONTENT */}

                    <div className="p-6 sm:p-8 lg:p-10">

                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

                            {/* LEFT CONTENT */}

                            <div className="lg:col-span-2">

                                {/* About */}

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                        Facility Information
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        About this facility
                                    </h2>

                                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                        {facility.description ||
                                            "No description is available for this facility."}
                                    </p>
                                </div>

                                {/* INFORMATION CARDS */}

                                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    {/* Sport */}

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/40">

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                                <Trophy size={20} />
                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Sport
                                                </p>

                                                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                                                    {facility.sport?.sportName ||
                                                        "Not specified"}
                                                </p>

                                                {facility.sport?.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                        {
                                                            facility.sport
                                                                .description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/40">

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                                <MapPin size={20} />
                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Location
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-900">
                                                    {facility.location ||
                                                        "Not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ADDRESS */}

                                {facility.address && (
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                <MapPin size={20} />
                                            </div>

                                            <div>

                                                <p className="text-sm font-bold text-slate-900">
                                                    Full Address
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                    {facility.address}
                                                </p>

                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MOBILE OPENING HOURS*/}

                                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:hidden">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                            <Clock3 size={20} />
                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Opening Hours
                                            </p>

                                            <p className="mt-1 text-base font-bold text-slate-900">
                                                {formatTime(
                                                    facility.openingTime
                                                )}{" "}
                                                —{" "}
                                                {formatTime(
                                                    facility.closingTime
                                                )}
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*  BOOKING SIDEBAR */}

                            <aside>

                                <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                                    {/* Sidebar Header */}

                                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">

                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                            Booking
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                                            Plan your activity
                                        </h3>

                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                            Reserve this facility for your
                                            next game or training session.
                                        </p>
                                    </div>

                                    {/* Sidebar Content */}

                                    <div className="p-6">

                                        {/* Opening Hours */}

                                        <div className="hidden items-center gap-4 lg:flex">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                                <Clock3 size={20} />
                                            </div>

                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Opening Hours
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-900">
                                                    {formatTime(
                                                        facility.openingTime
                                                    )}{" "}
                                                    —{" "}
                                                    {formatTime(
                                                        facility.closingTime
                                                    )}
                                                </p>

                                            </div>
                                        </div>

                                        <div className="my-5 h-px bg-slate-100" />

                                        {/* Availability */}

                                        <div className="flex items-center gap-4">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                                <CheckCircle2 size={20} />
                                            </div>

                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Availability
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-900">
                                                    {isActive
                                                        ? "Available for booking"
                                                        : "Currently unavailable"}
                                                </p>

                                            </div>
                                        </div>

                                        {/* Booking Button */}

                                        <Link
                                            to={`/bookings/create?facilityId=${facility.facilityId}`}
                                            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-sm transition ${
                                                isActive
                                                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                                                    : "pointer-events-none bg-slate-300"
                                            }`}
                                        >
                                            <CalendarDays size={18} />

                                            {isActive
                                                ? "Book This Facility"
                                                : "Currently Unavailable"}
                                        </Link>

                                        <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                                            Booking availability may depend
                                            on the selected date and time.
                                        </p>

                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>

                {/* BOTTOM NAVIGATION */}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <Link
                        to="/facilities"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                    >
                        <ArrowLeft size={16} />

                        Explore more facilities
                    </Link>

                    <Link
                        to="/sports"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                        Explore sports

                        <Trophy size={16} />
                    </Link>

                </div>
            </main>
        </div>
    );
}