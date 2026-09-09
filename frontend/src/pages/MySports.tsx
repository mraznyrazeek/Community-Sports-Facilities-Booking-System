import { useEffect, useState } from "react";
import {
    Trophy,
    CalendarDays,
    Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
    getMySports,
    removeMySport,
} from "../services/api";


// ============================================================
// TYPES
// ============================================================

interface Sport {
    sportId: number;
    sportName: string;
    description?: string;
}

interface MemberSport {
    memberId: number;
    sportId: number;
    joinedAt: string;
    sport: Sport | null;
}


// ============================================================
// PAGE
// ============================================================

export default function MySports() {

    const [sports, setSports] = useState<MemberSport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [removingSportId, setRemovingSportId] =
        useState<number | null>(null);


    // ========================================================
    // LOAD MEMBER SPORTS
    // ========================================================

    useEffect(() => {

        const loadMySports = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getMySports();

                setSports(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your registered sports."
                );

            } finally {

                setLoading(false);

            }
        };

        loadMySports();

    }, []);


    // ========================================================
    // REMOVE SPORT
    // ========================================================

    const handleRemoveSport = async (
        sportId: number
    ) => {

        const confirmed = window.confirm(
            "Are you sure you want to remove this sport from your registered sports?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setRemovingSportId(sportId);

            await removeMySport(sportId);

            setSports((currentSports) =>
                currentSports.filter(
                    (item) =>
                        item.sportId !== sportId
                )
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to remove the sport."
            );

        } finally {

            setRemovingSportId(null);

        }
    };


    // ========================================================
    // PAGE UI
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        My Sports
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        View and manage your registered sports.
                    </p>

                </div>
            </section>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        {error}

                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                        {[1, 2, 3].map((item) => (

                            <div
                                key={item}
                                className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
                            />

                        ))}

                    </div>

                )}


                {/* =================================================
                    NO SPORTS
                ================================================= */}

                {!loading &&
                    sports.length === 0 &&
                    !error && (

                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                                <Trophy size={26} />

                            </div>

                            <h2 className="mt-5 text-xl font-bold text-slate-900">
                                No registered sports
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                You have not registered for any sports yet.
                                Explore the available sports and choose your
                                favourites.
                            </p>

                            <Link
                                to="/sports"
                                className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Explore Sports
                            </Link>

                        </div>

                    )}


                {/* =================================================
                    SPORTS LIST
                ================================================= */}

                {!loading &&
                    sports.length > 0 && (

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {sports.map((item) => (

                                <div
                                    key={item.sportId}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                                >

                                    {/* ICON */}

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                        <Trophy size={23} />

                                    </div>


                                    {/* SPORT NAME */}

                                    <h2 className="mt-5 text-xl font-bold text-slate-900">

                                        {item.sport?.sportName ||
                                            "Unknown Sport"}

                                    </h2>


                                    {/* DESCRIPTION */}

                                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">

                                        {item.sport?.description ||
                                            "No description available."}

                                    </p>


                                    {/* JOINED DATE */}

                                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">

                                        <CalendarDays size={16} />

                                        <span>
                                            Registered{" "}
                                            {item.joinedAt
                                                ? new Date(
                                                    item.joinedAt
                                                ).toLocaleDateString()
                                                : "Unknown"}
                                        </span>

                                    </div>


                                    {/* REMOVE BUTTON */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveSport(
                                                item.sportId
                                            )
                                        }
                                        disabled={
                                            removingSportId ===
                                            item.sportId
                                        }
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <Trash2 size={16} />

                                        {removingSportId ===
                                        item.sportId
                                            ? "Removing..."
                                            : "Remove"}

                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

            </main>

        </div>
    );
}