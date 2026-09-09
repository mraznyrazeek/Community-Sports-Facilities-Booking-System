import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Search,
    Trophy,
    X,
    AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../components/navigation/PublicNavbar";
import CustomerNavbar from "../components/navigation/CustomerNavbar";

import {
    getCurrentMember,
    getSports,
    getMySports,
    registerForSport,
    removeMySport,
} from "../services/api";

interface Sport {
    id?: number;
    sportId?: number;
    name?: string;
    sportName?: string;
    description?: string;
}

interface MemberSport {
    id?: number;
    sportId?: number;
    name?: string;
    sportName?: string;
    sport?: Sport;
}

/*
|--------------------------------------------------------------------------
| Modal Types
|--------------------------------------------------------------------------
*/

type ModalType =
    | "register"
    | "withdraw"
    | "success"
    | null;

/*
|--------------------------------------------------------------------------
| Sports Page
|--------------------------------------------------------------------------
*/

export default function Sports() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [mySports, setMySports] = useState<MemberSport[]>([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [mySportsLoading, setMySportsLoading] = useState(false);

    const [error, setError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Modal State
    |--------------------------------------------------------------------------
    */

    const [modalType, setModalType] = useState<ModalType>(null);

    const [selectedSport, setSelectedSport] =
        useState<Sport | null>(null);

    const [actionLoading, setActionLoading] = useState(false);

    const [modalError, setModalError] = useState("");

    const [successMessage, setSuccessMessage] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const member = getCurrentMember();

    const isLoggedInMember =
        !!localStorage.getItem("token") &&
        member?.role?.toLowerCase() === "member";

    /*
    |--------------------------------------------------------------------------
    | Load Sports
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Load Member Sports
    |--------------------------------------------------------------------------
    */

    const loadMySports = async () => {
        if (!isLoggedInMember) {
            setMySports([]);
            return;
        }

        try {
            setMySportsLoading(true);

            const data = await getMySports();

            if (Array.isArray(data)) {
                setMySports(data as MemberSport[]);
            } else {
                setMySports([]);
            }
        } catch (err) {
            console.error("Unable to load registered sports:", err);
            setMySports([]);
        } finally {
            setMySportsLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        loadSports();
    }, []);

    useEffect(() => {
        loadMySports();
    }, [isLoggedInMember]);

    /*
    |--------------------------------------------------------------------------
    | Get Sport ID
    |--------------------------------------------------------------------------
    */

    const getSportId = (sport: Sport) => {
        return sport.sportId ?? sport.id;
    };

    /*
    |--------------------------------------------------------------------------
    | Get Sport Name
    |--------------------------------------------------------------------------
    */

    const getSportName = (sport: Sport) => {
        return (
            sport.name ||
            sport.sportName ||
            "Sport"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Check If Sport Is Registered
    |--------------------------------------------------------------------------
    */

    const isSportRegistered = (sport: Sport) => {
        const sportId = getSportId(sport);

        if (!sportId) {
            return false;
        }

        return mySports.some((memberSport) => {
            const registeredSportId =
                memberSport.sportId ??
                memberSport.sport?.sportId ??
                memberSport.sport?.id ??
                memberSport.id;

            return Number(registeredSportId) === Number(sportId);
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Clear Search
    |--------------------------------------------------------------------------
    */

    const clearSearch = () => {
        setSearch("");
    };

    /*
    |--------------------------------------------------------------------------
    | Open Register Modal
    |--------------------------------------------------------------------------
    */

    const openRegisterModal = (sport: Sport) => {
        if (!isLoggedInMember) {
            window.location.href = "/login";
            return;
        }

        setSelectedSport(sport);
        setModalError("");
        setModalType("register");
    };

    /*
    |--------------------------------------------------------------------------
    | Open Withdraw Modal
    |--------------------------------------------------------------------------
    */

    const openWithdrawModal = (sport: Sport) => {
        if (!isLoggedInMember) {
            window.location.href = "/login";
            return;
        }

        setSelectedSport(sport);
        setModalError("");
        setModalType("withdraw");
    };

    /*
    |--------------------------------------------------------------------------
    | Close Modal
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {
        if (actionLoading) {
            return;
        }

        setModalType(null);
        setSelectedSport(null);
        setModalError("");
    };

    /*
    |--------------------------------------------------------------------------
    | Register Sport
    |--------------------------------------------------------------------------
    */

    const handleRegister = async () => {
        if (!selectedSport) {
            return;
        }

        const sportId = getSportId(selectedSport);

        if (!sportId) {
            setModalError("Unable to determine the sport ID.");
            return;
        }

        try {
            setActionLoading(true);
            setModalError("");

            await registerForSport(sportId);

            /*
             * Refresh registered sports from backend.
             */
            await loadMySports();

            setSuccessMessage(
                `You have successfully registered for ${getSportName(
                    selectedSport
                )}.`
            );

            setModalType("success");
        } catch (err: unknown) {
            setModalError(
                err instanceof Error
                    ? err.message
                    : "Unable to register for this sport."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Withdraw From Sport
    |--------------------------------------------------------------------------
    */

    const handleWithdraw = async () => {
        if (!selectedSport) {
            return;
        }

        const sportId = getSportId(selectedSport);

        if (!sportId) {
            setModalError("Unable to determine the sport ID.");
            return;
        }

        try {
            setActionLoading(true);
            setModalError("");

            await removeMySport(sportId);

            /*
             * Refresh registered sports from backend.
             */
            await loadMySports();

            setSuccessMessage(
                `You have successfully withdrawn from ${getSportName(
                    selectedSport
                )}.`
            );

            setModalType("success");
        } catch (err: unknown) {
            setModalError(
                err instanceof Error
                    ? err.message
                    : "Unable to withdraw from this sport."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==============================================================
                NAVBAR
            ============================================================== */}

            {isLoggedInMember ? (
                <CustomerNavbar />
            ) : (
                <PublicNavbar />
            )}

            <main className="min-h-screen bg-slate-50">

                {/* ==========================================================
    HERO
========================================================== */}

                <section className="border-b border-slate-200 bg-slate-50">

                    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            {/* Title */}
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                    Find your{" "}
                                    <span className="text-blue-600">
                                        sport.
                                    </span>
                                </h1>

                                <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
                                    Explore sports and activities available in your community.
                                </p>
                            </div>

                            {/* Search */}
                            <div className="w-full sm:max-w-sm">

                                <label
                                    htmlFor="sport-search"
                                    className="sr-only"
                                >
                                    Search sports
                                </label>

                                <div className="relative">

                                    <Search
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="sport-search"
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search sports..."
                                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                            aria-label="Clear search"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ==========================================================
                    SPORTS LIST
                ========================================================== */}

                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    {/* Header */}

                    {!loading && !error && (
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    Available Sports
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    {search
                                        ? `${filteredSports.length} result${filteredSports.length !== 1
                                            ? "s"
                                            : ""
                                        } found`
                                        : `${sports.length} sport${sports.length !== 1
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

                    {/* ======================================================
                        LOADING
                    ====================================================== */}

                    {loading && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div
                                    key={item}
                                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                                >

                                    <div className="flex items-center justify-between">

                                        <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />

                                        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />

                                    </div>

                                    <div className="mt-6 h-6 w-36 animate-pulse rounded-lg bg-slate-200" />

                                    <div className="mt-4 space-y-2">

                                        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                                        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />

                                    </div>

                                    <div className="mt-7 h-10 w-full animate-pulse rounded-xl bg-slate-100" />

                                </div>
                            ))}

                        </div>
                    )}

                    {/* ======================================================
                        ERROR
                    ====================================================== */}

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
                                onClick={() => loadSports()}
                                className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Try Again
                            </button>

                        </div>
                    )}

                    {/* ======================================================
                        SPORT CARDS
                    ====================================================== */}

                    {!loading &&
                        !error &&
                        filteredSports.length > 0 && (

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                {filteredSports.map((sport, index) => {

                                    const id =
                                        getSportId(sport) ??
                                        index;

                                    const name =
                                        getSportName(sport);

                                    const description =
                                        sport.description ||
                                        "Explore this sport and discover available activities.";

                                    const registered =
                                        isSportRegistered(sport);

                                    return (

                                        <article
                                            key={`${id}-${name}`}
                                            className={`group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl ${registered
                                                    ? "border-emerald-300"
                                                    : "border-slate-200 hover:border-blue-200"
                                                }`}
                                        >

                                            {/* Top gradient */}

                                            <div
                                                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition ${registered
                                                        ? "opacity-100"
                                                        : "opacity-0 group-hover:opacity-100"
                                                    }`}
                                            />

                                            {/* Card Header */}

                                            <div className="flex items-start justify-between">

                                                <div
                                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl transition duration-300 ${registered
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                                                        }`}
                                                >

                                                    {registered ? (
                                                        <CheckCircle2
                                                            size={25}
                                                        />
                                                    ) : (
                                                        <Trophy
                                                            size={24}
                                                        />
                                                    )}

                                                </div>

                                                {/* Status */}

                                                <span
                                                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${registered
                                                            ? "bg-emerald-50 text-emerald-600"
                                                            : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    {registered
                                                        ? "Registered"
                                                        : "Sport"}
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

                                            {/* ==================================================
                                                REGISTERED STATE
                                            ================================================== */}

                                            {registered ? (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openWithdrawModal(
                                                            sport
                                                        )
                                                    }
                                                    disabled={
                                                        mySportsLoading
                                                    }
                                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >

                                                    <X size={17} />

                                                    Withdraw from Sport

                                                </button>

                                            ) : (

                                                /* ==================================================
                                                    NOT REGISTERED STATE
                                                ================================================== */

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openRegisterModal(
                                                            sport
                                                        )
                                                    }
                                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                                                >

                                                    Register for Sport

                                                    <ArrowRight
                                                        size={17}
                                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                                    />

                                                </button>

                                            )}

                                        </article>
                                    );
                                })}

                            </div>
                        )}

                    {/* ======================================================
                        NO RESULTS
                    ====================================================== */}

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

                {/* ==========================================================
                    BOTTOM CTA
                ========================================================== */}

                {!loading &&
                    !error &&
                    sports.length > 0 && (

                        <section className="border-t border-slate-200 bg-white">

                            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

                                    <div className="px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-12">

                                        <div className="max-w-2xl">


                                            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                                Ready to play?
                                            </h2>

                                            <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                                                Find a facility near you and
                                                book your next sporting
                                                activity.
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

            {/* ==============================================================
                MODALS
            ============================================================== */}

            {modalType && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    {/* ======================================================
                        REGISTER CONFIRMATION
                    ====================================================== */}

                    {modalType === "register" && selectedSport && (

                        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                            {/* Header */}

                            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                                <div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                                        <Trophy size={23} />

                                    </div>

                                    <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
                                        Register for Sport
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            {/* Content */}

                            <div className="px-6 py-6">

                                <p className="text-sm leading-6 text-slate-500">
                                    Would you like to register for{" "}
                                    <span className="font-bold text-slate-900">
                                        {getSportName(selectedSport)}
                                    </span>
                                    ?
                                </p>

                                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">

                                            <Trophy size={19} />

                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-slate-900">
                                                {getSportName(selectedSport)}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Community sport
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {modalError && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {modalError}
                                    </div>
                                )}

                            </div>

                            {/* Actions */}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRegister}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {actionLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={17} />
                                            Yes, Register
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>
                    )}

                    {/* ======================================================
                        WITHDRAW CONFIRMATION
                    ====================================================== */}

                    {modalType === "withdraw" && selectedSport && (

                        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                                <div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">

                                        <AlertTriangle size={23} />

                                    </div>

                                    <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
                                        Withdraw from Sport
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <div className="px-6 py-6">

                                <p className="text-sm leading-6 text-slate-500">

                                    Are you sure you want to withdraw from{" "}

                                    <span className="font-bold text-slate-900">
                                        {getSportName(selectedSport)}
                                    </span>
                                    ?

                                </p>

                                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">

                                    <p className="text-sm font-semibold text-red-800">
                                        You will no longer be registered for
                                        this sport.
                                    </p>

                                </div>

                                {modalError && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {modalError}
                                    </div>
                                )}

                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={actionLoading}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleWithdraw}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {actionLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Withdrawing...
                                        </>
                                    ) : (
                                        <>
                                            <X size={17} />
                                            Yes, Withdraw
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>
                    )}

                    {/* ======================================================
                        SUCCESS MODAL
                    ====================================================== */}

                    {modalType === "success" && selectedSport && (

                        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                            <div className="px-6 py-8 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                                    <CheckCircle2 size={34} />

                                </div>

                                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
                                    Successfully Updated
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {successMessage}
                                </p>

                                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">

                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Sport
                                    </p>

                                    <p className="mt-1 text-base font-bold text-slate-900">
                                        {getSportName(selectedSport)}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                                >
                                    Done
                                </button>

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}