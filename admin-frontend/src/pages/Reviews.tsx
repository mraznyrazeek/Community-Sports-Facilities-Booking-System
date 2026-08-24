import { useEffect, useMemo, useState } from "react";
import {
  deleteReview,
  getReviews,
  updateReview,
  type Review,
} from "../services/api";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const [editRating, setEditRating] =
    useState(5);

  const [editComment, setEditComment] =
    useState("");

  const [saving, setSaving] = useState(false);

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const data = await getReviews();

      setReviews(data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleDelete(
    reviewId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteReview(reviewId);

      setReviews((current) =>
        current.filter(
          (review) =>
            review.reviewId !== reviewId
        )
      );
    } catch (err: any) {
      alert(
        err?.message ||
          "Failed to delete review."
      );
    }
  }

  function openEdit(review: Review) {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(
      review.commentText || ""
    );
  }

  function closeEdit() {
    if (saving) {
      return;
    }

    setEditingReview(null);
    setEditRating(5);
    setEditComment("");
  }

  async function handleUpdate() {
    if (!editingReview) {
      return;
    }

    if (
      editRating < 1 ||
      editRating > 5
    ) {
      alert(
        "Rating must be between 1 and 5."
      );
      return;
    }

    try {
      setSaving(true);

      await updateReview(
        editingReview.reviewId,
        {
          rating: editRating,
          commentText:
            editComment.trim() || null,
        }
      );

      setReviews((current) =>
        current.map((review) =>
          review.reviewId ===
          editingReview.reviewId
            ? {
                ...review,
                rating: editRating,
                commentText:
                  editComment.trim() ||
                  null,
              }
            : review
        )
      );

      closeEdit();
    } catch (err: any) {
      alert(
        err?.message ||
          "Failed to update review."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredReviews = useMemo(() => {
    const value =
      search.toLowerCase().trim();

    if (!value) {
      return reviews;
    }

    return reviews.filter((review) => {
      return (
        review.memberName
          ?.toLowerCase()
          .includes(value) ||
        review.memberEmail
          ?.toLowerCase()
          .includes(value) ||
        review.facilityName
          ?.toLowerCase()
          .includes(value) ||
        review.commentText
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [reviews, search]);

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Community
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Reviews
        </h1>

        <p className="mt-2 text-gray-500">
          Review feedback submitted by
          community members.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="relative w-full max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-4-4" />
            </svg>
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by member, facility or comment..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-gray-500">
              Loading reviews...
            </p>
          </div>
        ) : filteredReviews.length ===
          0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-gray-400"
              >
                <path d="M4 5h16v14H4z" />
                <path d="M8 9h8M8 13h5" />
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No reviews found
            </h3>

            <p className="mt-1 text-gray-500">
              {search
                ? "No reviews match your search."
                : "No member reviews are currently available."}
            </p>
          </div>
        ) : (
          <div>
            {filteredReviews.map(
              (review) => (
                <div
                  key={review.reviewId}
                  className="border-b border-gray-100 p-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-600">
                          {review.memberName
                            ?.charAt(0)
                            .toUpperCase() ||
                            "M"}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            {review.memberName ||
                              "Unknown Member"}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {review.memberEmail ||
                              "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Facility
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {review.facilityName ||
                            "Unknown Facility"}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <span
                                key={star}
                                className={
                                  star <=
                                  review.rating
                                    ? "text-xl text-yellow-500"
                                    : "text-xl text-gray-300"
                                }
                              >
                                ★
                              </span>
                            )
                          )}
                        </div>

                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {review.rating}/5
                        </span>
                      </div>

                      {review.commentText && (
                        <p className="mt-4 leading-6 text-gray-700">
                          {review.commentText}
                        </p>
                      )}

                      <p className="mt-3 text-sm text-gray-400">
                        {new Date(
                          review.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(review)
                        }
                        title="Edit review"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            review.reviewId
                          )
                        }
                        title="Delete review"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M4 7h16" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M6 7l1 13h10l1-13" />
                          <path d="M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Review
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingReview.memberName}
                  {" • "}
                  {editingReview.facilityName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">
                Rating
              </label>

              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setEditRating(star)
                      }
                      className="text-3xl"
                    >
                      <span
                        className={
                          star <= editRating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  )
                )}

                <span className="ml-2 text-sm text-gray-500">
                  {editRating}/5
                </span>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700">
                Comment
              </label>

              <textarea
                value={editComment}
                onChange={(e) =>
                  setEditComment(
                    e.target.value
                  )
                }
                rows={5}
                maxLength={500}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                placeholder="Review comment..."
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {editComment.length}/500
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}