import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Loader2,
    MessageSquare,
    Pencil,
    Send,
    Star,
    Trash2,
} from "lucide-react";

import {
    createReview,
    deleteReview,
    getFacilityReviews,
    getMyReviews,
    updateReview,
} from "../services/api";

interface Review {
    reviewId: number;
    memberId: number;
    memberName: string;
    facilityId: number;
    rating: number;
    commentText?: string;
    createdAt?: string;
}

interface FacilityReviewsProps {
    facilityId: number;
}

export default function FacilityReviews({
    facilityId,
}: FacilityReviewsProps) {

    // =========================================================
    // STATE
    // =========================================================

    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReview, setMyReview] = useState<Review | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [commentText, setCommentText] = useState("");

    const [editing, setEditing] = useState(false);

    // =========================================================
    // LOAD REVIEWS
    // =========================================================

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const [facilityReviews, memberReviews] =
                await Promise.all([
                    getFacilityReviews(facilityId),
                    getMyReviews(),
                ]);

            setReviews(facilityReviews || []);

            const existingReview = (memberReviews || []).find(
                (review: Review) =>
                    Number(review.facilityId) === Number(facilityId)
            );

            setMyReview(existingReview || null);

            if (existingReview && !editing) {
                setRating(Number(existingReview.rating));
                setCommentText(
                    existingReview.commentText || ""
                );
            }

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load reviews."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [facilityId]);

    // =========================================================
    // RATING SUMMARY
    // =========================================================

    const averageRating = useMemo(() => {
        if (reviews.length === 0) {
            return 0;
        }

        const total = reviews.reduce(
            (sum, review) =>
                sum + Number(review.rating),
            0
        );

        return total / reviews.length;
    }, [reviews]);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date?: string) => {
        if (!date) {
            return "";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "";
        }

        return parsed.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {
        setRating(0);
        setHoverRating(0);
        setCommentText("");
        setEditing(false);
    };

    // =========================================================
    // START EDITING
    // =========================================================

    const startEditing = () => {
        if (!myReview) {
            return;
        }

        setRating(Number(myReview.rating));
        setCommentText(
            myReview.commentText || ""
        );

        setEditing(true);
        setError("");
        setSuccess("");

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    };

    // =========================================================
    // SUBMIT REVIEW
    // =========================================================

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (rating < 1 || rating > 5) {
            setError(
                "Please select a rating between 1 and 5 stars."
            );
            return;
        }

        if (commentText.length > 1000) {
            setError(
                "Comment cannot be longer than 1000 characters."
            );
            return;
        }

        try {
            setSubmitting(true);

            if (editing && myReview) {

                await updateReview(
                    myReview.reviewId,
                    {
                        rating,
                        commentText,
                    }
                );

                setSuccess(
                    "Your review has been updated successfully."
                );

            } else {

                await createReview({
                    facilityId,
                    rating,
                    commentText,
                });

                setSuccess(
                    "Your review has been submitted successfully."
                );
            }

            resetForm();

            await loadReviews();

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to submit your review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // DELETE REVIEW
    // =========================================================

    const handleDelete = async () => {
        if (!myReview) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete your review?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            setSubmitting(true);

            await deleteReview(
                myReview.reviewId
            );

            setMyReview(null);

            resetForm();

            setSuccess(
                "Your review has been deleted."
            );

            await loadReviews();

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete your review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <section className="mt-10">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

                    <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
                        <Loader2
                            size={22}
                            className="animate-spin"
                        />

                        <span className="text-sm font-medium">
                            Loading reviews...
                        </span>
                    </div>

                </div>
            </section>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <section className="mt-10">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <MessageSquare
                                size={20}
                                className="text-blue-600"
                            />

                            <h2 className="text-xl font-bold text-slate-900">
                                Reviews
                            </h2>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            See what members think about this facility.
                        </p>

                    </div>


                    {/* AVERAGE RATING */}

                    <div className="flex items-center gap-3">

                        <div className="text-right">

                            <div className="flex items-center justify-end gap-1">

                                <Star
                                    size={18}
                                    className="fill-yellow-400 text-yellow-400"
                                />

                                <span className="text-xl font-bold text-slate-900">
                                    {averageRating
                                        ? averageRating.toFixed(1)
                                        : "0.0"}
                                </span>

                            </div>

                            <p className="text-xs text-slate-400">
                                {reviews.length}{" "}
                                {reviews.length === 1
                                    ? "review"
                                    : "reviews"}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">

                        <p className="text-sm font-semibold text-red-800">
                            {error}
                        </p>

                    </div>
                )}


                {success && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                        <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0 text-emerald-600"
                        />

                        <p className="text-sm font-medium text-emerald-800">
                            {success}
                        </p>

                    </div>
                )}


                {/* =================================================
                    REVIEW LIST
                ================================================= */}

                <div className="mt-8">

                    {reviews.length === 0 ? (

                        <div className="rounded-2xl bg-slate-50 p-8 text-center">

                            <MessageSquare
                                size={30}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                No reviews yet
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Be the first member to review this facility.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {reviews.map((review) => (

                                <div
                                    key={review.reviewId}
                                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <p className="text-sm font-semibold text-slate-900">
                                                {review.memberName ||
                                                    "Member"}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">

                                                <div className="flex">

                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <Star
                                                                key={star}
                                                                size={14}
                                                                className={
                                                                    star <=
                                                                    Number(
                                                                        review.rating
                                                                    )
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-slate-300"
                                                                }
                                                            />
                                                        )
                                                    )}

                                                </div>

                                                <span className="text-xs text-slate-400">
                                                    {formatDate(
                                                        review.createdAt
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        {/* OWN REVIEW */}

                                        {myReview?.reviewId ===
                                            review.reviewId && (

                                            <div className="flex items-center gap-2">

                                                <button
                                                    type="button"
                                                    onClick={
                                                        startEditing
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-blue-600"
                                                    title="Edit review"
                                                >
                                                    <Pencil
                                                        size={16}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleDelete
                                                    }
                                                    disabled={
                                                        submitting
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                                                    title="Delete review"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        )}

                                    </div>


                                    {review.commentText && (

                                        <p className="mt-4 text-sm leading-6 text-slate-600">
                                            {review.commentText}
                                        </p>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </div>


                {/* =================================================
                    REVIEW FORM
                ================================================= */}

                {!myReview || editing ? (

                    <div className="mt-8 border-t border-slate-100 pt-8">

                        <div>

                            <h3 className="text-lg font-bold text-slate-900">
                                {editing
                                    ? "Edit your review"
                                    : "Write a review"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Only members who have booked this facility
                                can submit a review.
                            </p>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-6"
                        >

                            {/* RATING */}

                            <div>

                                <label className="text-sm font-semibold text-slate-800">
                                    Your rating
                                </label>

                                <div className="mt-3 flex items-center gap-1">

                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (

                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() =>
                                                    setHoverRating(
                                                        star
                                                    )
                                                }
                                                onMouseLeave={() =>
                                                    setHoverRating(
                                                        0
                                                    )
                                                }
                                                onClick={() =>
                                                    setRating(
                                                        star
                                                    )
                                                }
                                                className="rounded-lg p-1 transition hover:scale-110"
                                                aria-label={`${star} star`}
                                            >

                                                <Star
                                                    size={30}
                                                    className={
                                                        star <=
                                                        (hoverRating ||
                                                            rating)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-slate-300"
                                                    }
                                                />

                                            </button>

                                        )
                                    )}

                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    {rating === 0
                                        ? "Select a rating"
                                        : `${rating} out of 5 stars`}
                                </p>

                            </div>


                            {/* COMMENT */}

                            <div>

                                <div className="flex items-center justify-between">

                                    <label
                                        htmlFor="reviewComment"
                                        className="text-sm font-semibold text-slate-800"
                                    >
                                        Your comment
                                    </label>

                                    <span className="text-xs text-slate-400">
                                        {commentText.length}/1000
                                    </span>

                                </div>

                                <textarea
                                    id="reviewComment"
                                    value={commentText}
                                    maxLength={1000}
                                    onChange={(event) =>
                                        setCommentText(
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Tell other members about your experience..."
                                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="flex flex-col gap-3 sm:flex-row">

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {submitting ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />

                                            {editing
                                                ? "Update Review"
                                                : "Submit Review"}
                                        </>
                                    )}

                                </button>


                                {editing && (

                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        disabled={submitting}
                                        className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                )}

                            </div>

                        </form>

                    </div>

                ) : (

                    <div className="mt-8 border-t border-slate-100 pt-8">

                        <div className="rounded-2xl bg-emerald-50 p-5">

                            <div className="flex items-start gap-3">

                                <CheckCircle2
                                    size={20}
                                    className="mt-0.5 shrink-0 text-emerald-600"
                                />

                                <div>

                                    <p className="text-sm font-semibold text-emerald-900">
                                        You have already reviewed this facility
                                    </p>

                                    <p className="mt-1 text-sm text-emerald-700">
                                        You can edit or delete your review
                                        using the controls above.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </section>
    );
}