import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock3,
    Loader2,
    MapPin,
    Search,
    Star,
    Trophy,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../components/navigation/PublicNavbar";
import CustomerNavbar from "../components/navigation/CustomerNavbar";

import {
    getCurrentMember,
    getFacilities,
    getFacilityReviews,
} from "../services/api";

// ========================================================
// TYPES
// ========================================================

interface Sport {
    sportId?: number;
    sportName?: string;
}

interface Facility {
    facilityId?: number;
    facilityName?: string;
    location?: string;
    address?: string;
    status?: string;
    openingTime?: string;
    closingTime?: string;
    sport?: Sport;

    // REAL REVIEW DATA
    averageRating?: number;
    reviewCount?: number;
}

interface FacilityReview {
    reviewId: number;
    memberId: number;
    memberName?: string;
    facilityId: number;
    rating: number;
    commentText?: string | null;
    createdAt: string;
}

// ========================================================
// COMPONENT
// ========================================================

export default function Facilities() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedSport, setSelectedSport] = useState("All");

    // ====================================================
    // REVIEW MODAL
    // ====================================================

    const [selectedFacility, setSelectedFacility] =
        useState<Facility | null>(null);

    const [facilityReviews, setFacilityReviews] =
        useState<FacilityReview[]>([]);

    const [reviewsLoading, setReviewsLoading] =
        useState(false);

    const [reviewsError, setReviewsError] =
        useState("");

    // ====================================================
    // CURRENT MEMBER
    // ====================================================

    const member = getCurrentMember();

    const isLoggedInMember =
        !!localStorage.getItem("token") &&
        member?.role?.toLowerCase() === "member";

    // ========================================================
    // LOAD FACILITIES
    // ========================================================

    useEffect(() => {
        const loadFacilities = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getFacilities();

                if (Array.isArray(data)) {
                    setFacilities(data as Facility[]);
                } else {
                    setFacilities([]);
                }
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load facilities."
                );

                setFacilities([]);
            } finally {
                setLoading(false);
            }
        };

        loadFacilities();
    }, []);

    // ========================================================
    // SPORT FILTER OPTIONS
    // ========================================================

    const sports = useMemo(() => {
        const names = facilities
            .map((facility) => facility.sport?.sportName)
            .filter(
                (name): name is string =>
                    Boolean(name)
            );

        return [
            "All",
            ...Array.from(new Set(names)),
        ];
    }, [facilities]);

    // ========================================================
    // FILTER FACILITIES
    // ========================================================

    const filteredFacilities = useMemo(() => {
        const query = search.trim().toLowerCase();

        return facilities.filter((facility) => {
            const facilityName =
                facility.facilityName?.toLowerCase() || "";

            const location =
                facility.location?.toLowerCase() || "";

            const address =
                facility.address?.toLowerCase() || "";

            const sportName =
                facility.sport?.sportName?.toLowerCase() || "";

            const matchesSearch =
                !query ||
                facilityName.includes(query) ||
                location.includes(query) ||
                address.includes(query) ||
                sportName.includes(query);

            const matchesSport =
                selectedSport === "All" ||
                facility.sport?.sportName === selectedSport;

            return matchesSearch && matchesSport;
        });
    }, [
        facilities,
        search,
        selectedSport,
    ]);

    // ========================================================
    // HELPERS
    // ========================================================

    const formatTime = (
        time?: string
    ) => {
        if (!time) {
            return "—";
        }

        const value = String(time).substring(0, 5);
        const parts = value.split(":");

        if (parts.length < 2) {
            return value;
        }

        const hours = Number(parts[0]);
        const minutes = parts[1];

        if (Number.isNaN(hours)) {
            return value;
        }

        const period =
            hours >= 12 ? "PM" : "AM";

        const displayHour =
            hours % 12 || 12;

        return `${displayHour}:${minutes} ${period}`;
    };

    const isActive = (
        status?: string
    ) => {
        return (
            String(status || "")
                .toLowerCase()
                .trim() === "active"
        );
    };

    // ========================================================
    // RATING HELPERS
    // ========================================================

    const formatRating = (
        rating?: number
    ) => {
        if (
            rating === undefined ||
            rating === null ||
            rating <= 0
        ) {
            return "0.0";
        }

        return Number(rating).toFixed(1);
    };

    const hasReviews = (
        facility: Facility
    ) => {
        return (
            (facility.reviewCount ?? 0) > 0
        );
    };

    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters = () => {
        setSearch("");
        setSelectedSport("All");
    };

    // ========================================================
    // OPEN REVIEWS
    // ========================================================

    const openReviews = async (
        facility: Facility
    ) => {
        if (!facility.facilityId) {
            return;
        }

        setSelectedFacility(facility);
        setFacilityReviews([]);
        setReviewsError("");
        setReviewsLoading(true);

        try {
            const data = await getFacilityReviews(
                facility.facilityId
            );

            setFacilityReviews(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err: unknown) {
            setReviewsError(
                err instanceof Error
                    ? err.message
                    : "Unable to load reviews."
            );
        } finally {
            setReviewsLoading(false);
        }
    };

    // ========================================================
    // CLOSE REVIEWS
    // ========================================================

    const closeReviews = () => {
        if (reviewsLoading) {
            return;
        }

        setSelectedFacility(null);
        setFacilityReviews([]);
        setReviewsError("");
    };

    // ========================================================
    // FORMAT REVIEW DATE
    // ========================================================

    const formatReviewDate = (
        date?: string
    ) => {
        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ========================================================
    // RENDER STARS
    // ========================================================

    const renderStars = (
        rating: number,
        size = 18
    ) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(
                    (star) => (
                        <Star
                            key={star}
                            size={size}
                            className={
                                star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"
                            }
                        />
                    )
                )}
            </div>
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==================================================
                NAVBAR
            ================================================== */}

            {isLoggedInMember ? (
                <CustomerNavbar />
            ) : (
                <PublicNavbar />
            )}

            {/* ==========================================================
    HERO
========================================================== */}

            <section className="border-b border-slate-200 bg-slate-50">

                <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">

                    <div className="grid gap-5 lg:grid-cols-[1fr_480px] lg:items-center">

                        {/* Heading */}
                        <div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Find the right{" "}
                                <span className="text-blue-600">
                                    place to play.
                                </span>
                            </h1>

                            <p className="mt-2 text-base text-slate-500">
                                Explore sports facilities available in your community.
                            </p>

                        </div>


                        {/* Search */}
                        <div>

                            <label
                                htmlFor="facility-search"
                                className="sr-only"
                            >
                                Search facilities
                            </label>

                            <div className="relative">

                                <Search
                                    size={19}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="facility-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search facilities, locations..."
                                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        aria-label="Clear search"
                                    >
                                        <X size={17} />
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* Filter */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                        <div className="relative w-full sm:max-w-xs">

                            <Trophy
                                size={17}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <select
                                value={selectedSport}
                                onChange={(event) =>
                                    setSelectedSport(event.target.value)
                                }
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            >
                                {sports.map((sport) => (
                                    <option
                                        key={sport}
                                        value={sport}
                                    >
                                        {sport === "All"
                                            ? "All Sports"
                                            : sport}
                                    </option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">

                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>

                            </div>

                        </div>


                        {/* Clear filters */}
                        {(search || selectedSport !== "All") && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
                            >
                                <X size={16} />
                                Clear filters
                            </button>
                        )}

                    </div>

                </div>

            </section>
            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                {/* Results header */}

                {!loading && !error && (
                    <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                                Available Facilities
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {filteredFacilities.length}{" "}
                                {filteredFacilities.length === 1
                                    ? "facility"
                                    : "facilities"}{" "}
                                found
                            </p>

                        </div>

                    </div>
                )}

                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                                >

                                    <div className="h-44 animate-pulse bg-slate-200" />

                                    <div className="p-6">

                                        <div className="h-6 w-3/5 animate-pulse rounded-lg bg-slate-200" />

                                        <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-slate-100" />

                                        <div className="mt-6 space-y-3">

                                            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                                            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />

                                        </div>

                                        <div className="mt-6 h-11 w-full animate-pulse rounded-xl bg-slate-100" />

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

                {/* ==================================================
                    ERROR
                ================================================== */}

                {!loading && error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                            <Building2 size={25} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-red-900">
                            Unable to load facilities
                        </h3>

                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            <Loader2 size={16} />
                            Try Again
                        </button>

                    </div>
                )}

                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!loading &&
                    !error &&
                    filteredFacilities.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Building2 size={28} />
                            </div>

                            <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                                No facilities found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Try changing your search or selecting
                                a different sport.
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                            >
                                Clear Filters
                            </button>

                        </div>
                    )}

                {/* ==================================================
                    FACILITY GRID
                ================================================== */}

                {!loading &&
                    !error &&
                    filteredFacilities.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                            {filteredFacilities.map(
                                (facility, index) => {

                                    const id =
                                        facility.facilityId ??
                                        index;

                                    const name =
                                        facility.facilityName ||
                                        "Sports Facility";

                                    const sportName =
                                        facility.sport?.sportName ||
                                        "Sports Facility";

                                    const location =
                                        facility.location ||
                                        facility.address ||
                                        "Location not available";

                                    const active =
                                        isActive(
                                            facility.status
                                        );

                                    const reviewCount =
                                        facility.reviewCount ?? 0;

                                    const averageRating =
                                        facility.averageRating ?? 0;

                                    return (
                                        <div
                                            key={`${id}-${name}`}
                                            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
                                        >

                                            {/* ==================================================
                                                TOP AREA
                                            ================================================== */}

                                            <Link
                                                to={`/facility/${id}`}
                                                className="block"
                                            >

                                                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950">

                                                    <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 transition duration-500 group-hover:scale-125" />

                                                    <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/10 transition duration-500 group-hover:scale-110" />

                                                    <div className="absolute inset-0 flex items-center justify-center">

                                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-white/15">

                                                            <Trophy
                                                                size={29}
                                                            />

                                                        </div>

                                                    </div>

                                                    <span
                                                        className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-[11px] font-bold backdrop-blur-md ${active
                                                            ? "border-emerald-300/20 bg-emerald-500/90 text-white"
                                                            : "border-white/10 bg-slate-900/70 text-slate-200"
                                                            }`}
                                                    >
                                                        {facility.status ||
                                                            "Unknown"}
                                                    </span>

                                                </div>

                                            </Link>

                                            {/* ==================================================
                                                CARD CONTENT
                                            ================================================== */}

                                            <div className="p-6">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="min-w-0">

                                                        <Link
                                                            to={`/facility/${id}`}
                                                        >
                                                            <h3 className="truncate text-xl font-extrabold tracking-tight text-slate-900 transition group-hover:text-blue-600">
                                                                {name}
                                                            </h3>
                                                        </Link>

                                                        <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">

                                                            <Trophy
                                                                size={13}
                                                            />

                                                            <span className="truncate">
                                                                {sportName}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <Link
                                                        to={`/facility/${id}`}
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition duration-300 hover:bg-blue-600 hover:text-white"
                                                    >

                                                        <ArrowRight
                                                            size={18}
                                                        />

                                                    </Link>

                                                </div>

                                                {/* ==================================================
                                                    REAL RATING
                                                ================================================== */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openReviews(
                                                            facility
                                                        )
                                                    }
                                                    className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-yellow-200 hover:bg-yellow-50/40"
                                                    aria-label={`View reviews for ${name}`}
                                                >

                                                    {hasReviews(
                                                        facility
                                                    ) ? (
                                                        <>
                                                            <div className="flex shrink-0 items-center gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(
                                                                    (
                                                                        star
                                                                    ) => (
                                                                        <Star
                                                                            key={
                                                                                star
                                                                            }
                                                                            size={
                                                                                17
                                                                            }
                                                                            className={
                                                                                star <=
                                                                                    Math.round(
                                                                                        averageRating
                                                                                    )
                                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                                    : "text-slate-300"
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </div>

                                                            <span className="text-sm font-extrabold text-slate-800">
                                                                {formatRating(
                                                                    averageRating
                                                                )}
                                                            </span>

                                                            <span className="text-slate-300">
                                                                •
                                                            </span>

                                                            <span className="text-sm font-semibold text-blue-600">
                                                                {reviewCount}{" "}
                                                                {reviewCount ===
                                                                    1
                                                                    ? "review"
                                                                    : "reviews"}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex shrink-0 items-center gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(
                                                                    (
                                                                        star
                                                                    ) => (
                                                                        <Star
                                                                            key={
                                                                                star
                                                                            }
                                                                            size={
                                                                                17
                                                                            }
                                                                            className="text-slate-300"
                                                                        />
                                                                    )
                                                                )}
                                                            </div>

                                                            <span className="text-sm font-semibold text-slate-400">
                                                                No reviews yet
                                                            </span>
                                                        </>
                                                    )}

                                                </button>

                                                {/* ==================================================
                                                    DETAILS
                                                ================================================== */}

                                                <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">

                                                    <div className="flex items-start gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                                                            <MapPin
                                                                size={16}
                                                            />
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                                Location
                                                            </p>

                                                            <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                                                                {location}
                                                            </p>

                                                        </div>

                                                    </div>

                                                    <div className="flex items-start gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                                                            <Clock3
                                                                size={16}
                                                            />
                                                        </div>

                                                        <div>

                                                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                                Opening Hours
                                                            </p>

                                                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                                                {formatTime(
                                                                    facility.openingTime
                                                                )}{" "}
                                                                <span className="font-normal text-slate-400">
                                                                    —
                                                                </span>{" "}
                                                                {formatTime(
                                                                    facility.closingTime
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* FOOTER */}

                                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                                                    <Link
                                                        to={`/facility/${id}`}
                                                        className="text-xs font-medium text-slate-400 hover:text-blue-600"
                                                    >
                                                        View facility
                                                    </Link>

                                                    <Link
                                                        to={`/facility/${id}`}
                                                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600"
                                                    >
                                                        Details

                                                        <ArrowRight
                                                            size={15}
                                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                                        />
                                                    </Link>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

            </main>

            {/* BOTTOM CTA */}

            {!loading &&
                !error &&
                facilities.length > 0 && (
                    <section className="border-t border-slate-200 bg-white">

                        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

                                <div className="px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-12">

                                    <div className="max-w-2xl">

                                        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                            Ready to play?
                                        </h2>

                                        <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                                            Choose a facility, check its
                                            availability and book your
                                            next sporting activity.
                                        </p>

                                    </div>

                                    <Link
                                        to="/sports"
                                        className="mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50 lg:mt-0"
                                    >
                                        Explore Sports
                                        <ArrowRight size={17} />
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

            {/* REVIEWS MODAL */}

            {selectedFacility && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeReviews();
                        }
                    }}
                >

                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">

                            <div className="min-w-0">

                                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                    Customer Reviews
                                </p>

                                <h2 className="mt-1 truncate text-xl font-extrabold text-slate-900 sm:text-2xl">
                                    {selectedFacility.facilityName}
                                </h2>

                                <div className="mt-2 flex flex-wrap items-center gap-2">

                                    {hasReviews(
                                        selectedFacility
                                    ) ? (
                                        <>
                                            <div className="flex items-center gap-0.5">
                                                {renderStars(
                                                    Math.round(
                                                        selectedFacility.averageRating ??
                                                        0
                                                    ),
                                                    16
                                                )}
                                            </div>

                                            <span className="text-sm font-extrabold text-slate-800">
                                                {formatRating(
                                                    selectedFacility.averageRating
                                                )}
                                            </span>

                                            <span className="text-slate-300">
                                                •
                                            </span>

                                            <span className="text-sm text-slate-500">
                                                {
                                                    selectedFacility.reviewCount
                                                }{" "}
                                                {selectedFacility.reviewCount ===
                                                    1
                                                    ? "review"
                                                    : "reviews"}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-slate-400">
                                            No reviews yet
                                        </span>
                                    )}

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={closeReviews}
                                disabled={reviewsLoading}
                                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                aria-label="Close reviews"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* MODAL CONTENT */}

                        <div className="overflow-y-auto px-6 py-6 sm:px-7">

                            {/* LOADING */}

                            {reviewsLoading && (
                                <div className="py-14 text-center">

                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                                        <Loader2
                                            size={24}
                                            className="animate-spin"
                                        />

                                    </div>

                                    <p className="mt-4 text-sm font-medium text-slate-500">
                                        Loading customer reviews...
                                    </p>

                                </div>
                            )}

                            {/* ERROR */}

                            {!reviewsLoading &&
                                reviewsError && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">

                                        <p className="text-sm font-semibold text-red-700">
                                            {reviewsError}
                                        </p>

                                    </div>
                                )}

                            {/* NO REVIEWS */}

                            {!reviewsLoading &&
                                !reviewsError &&
                                facilityReviews.length === 0 && (
                                    <div className="py-14 text-center">

                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                            <Star
                                                size={26}
                                            />

                                        </div>

                                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                                            No reviews yet
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                            Be the first customer to share
                                            your experience with this facility.
                                        </p>

                                    </div>
                                )}

                            {/* REVIEWS */}

                            {!reviewsLoading &&
                                !reviewsError &&
                                facilityReviews.length > 0 && (
                                    <div className="space-y-4">

                                        {facilityReviews.map(
                                            (review) => (
                                                <div
                                                    key={
                                                        review.reviewId
                                                    }
                                                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                                                >

                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                        <div>

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {review.memberName ||
                                                                    "Member"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {formatReviewDate(
                                                                    review.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                        <div className="flex items-center gap-2">

                                                            {renderStars(
                                                                Number(
                                                                    review.rating
                                                                ),
                                                                17
                                                            )}

                                                            <span className="text-sm font-bold text-slate-700">
                                                                {Number(
                                                                    review.rating
                                                                ).toFixed(
                                                                    0
                                                                )}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    {review.commentText && (
                                                        <p className="mt-4 text-sm leading-6 text-slate-600">
                                                            "
                                                            {
                                                                review.commentText
                                                            }
                                                            "
                                                        </p>
                                                    )}

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-7">

                            <div className="flex items-center justify-between gap-4">

                                <div className="flex items-center gap-2 text-xs text-slate-400">

                                    <CheckCircle2
                                        size={15}
                                    />

                                    Reviews from SportsHub members

                                </div>

                                <button
                                    type="button"
                                    onClick={closeReviews}
                                    disabled={reviewsLoading}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}