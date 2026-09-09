import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  MapPin,
  MessageSquare,
  Pencil,
  Search,
  Star,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  createReview,
  deleteReview,
  getCurrentMember,
  getReviewableBookings,
  getReviews,
  updateReview,
} from "../services/api";

interface Review {
  reviewId: number;
  memberId: number;
  memberName: string;
  facilityId: number;
  facilityName: string;
  rating: number;
  commentText: string;
  createdAt: string;
}

interface ReviewableBooking {
  bookingId: number;
  facilityId: number;
  facilityName: string;
  location: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  reviewId?: number | null;
  rating?: number | null;
  commentText?: string | null;
}

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

const REVIEWS_PER_PAGE = 6;

const Reviews = () => {
  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [reviews, setReviews] = useState<Review[]>([]);

  const [reviewableBookings, setReviewableBookings] =
    useState<ReviewableBooking[]>([]);

  const [isLoggedInMember, setIsLoggedInMember] =
    useState(false);

  const [currentMemberId, setCurrentMemberId] =
    useState<number | null>(null);

  const [loadingReviews, setLoadingReviews] =
    useState(true);

  const [loadingBookings, setLoadingBookings] =
    useState(false);

  /*
   * Search / filters
   */

  const [searchText, setSearchText] =
    useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [ratingFilter, setRatingFilter] =
    useState("all");

  const [facilityFilter, setFacilityFilter] =
    useState("all");

  const [showFilters, setShowFilters] =
    useState(false);

  /*
   * Community pagination
   */

  const [currentPage, setCurrentPage] =
    useState(1);

  /*
   * Review create/edit modal
   */

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState<ReviewableBooking | null>(null);

  /*
   * Review details modal
   */

  const [detailsModalOpen, setDetailsModalOpen] =
    useState(false);

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  /*
   * Form
   */

  const [rating, setRating] =
    useState(5);

  const [commentText, setCommentText] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /*
   * =========================================================
   * LOAD CURRENT MEMBER
   * =========================================================
   */

  const loadCurrentMember = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setIsLoggedInMember(false);
        setCurrentMemberId(null);
        return;
      }

      const member =
        await getCurrentMember();

      if (!member) {
        setIsLoggedInMember(false);
        setCurrentMemberId(null);
        return;
      }

      const role =
        member.userRole ||
        member.role ||
        member.UserRole ||
        member.Role;

      const memberId =
        member.memberId ??
        member.MemberId ??
        member.id ??
        member.Id;

      /*
       * Make sure the logged-in account is a member.
       */

      if (
        role &&
        String(role).toLowerCase() !==
        "member"
      ) {
        setIsLoggedInMember(false);
        setCurrentMemberId(null);
        return;
      }

      setIsLoggedInMember(true);

      setCurrentMemberId(
        memberId !== undefined &&
          memberId !== null
          ? Number(memberId)
          : null
      );
    } catch (error) {
      console.error(
        "Failed to load current member:",
        error
      );

      setIsLoggedInMember(false);
      setCurrentMemberId(null);
    }
  };

  /*
   * =========================================================
   * LOAD ALL COMMUNITY REVIEWS
   * =========================================================
   */

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);

      const data =
        await getReviews();

      setReviews(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  /*
   * =========================================================
   * LOAD MEMBER REVIEWABLE BOOKINGS
   * =========================================================
   */

  const loadReviewableBookings =
    async () => {
      if (!isLoggedInMember) {
        setReviewableBookings([]);
        return;
      }

      try {
        setLoadingBookings(true);

        const data =
          await getReviewableBookings();

        setReviewableBookings(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load reviewable bookings:",
          error
        );

        setReviewableBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    const initialise =
      async () => {
        await loadCurrentMember();
        await loadReviews();
      };

    initialise();
  }, []);

  /*
   * =========================================================
   * LOAD BOOKINGS AFTER LOGIN STATE
   * =========================================================
   */

  useEffect(() => {
    if (isLoggedInMember) {
      loadReviewableBookings();
    }
  }, [isLoggedInMember]);

  /*
   * =========================================================
   * FACILITIES FOR FILTER
   * =========================================================
   */

  const facilities = useMemo(() => {
    const uniqueFacilities =
      Array.from(
        new Map(
          reviews.map(
            (review) => [
              review.facilityId,
              review.facilityName,
            ]
          )
        ).entries()
      );

    return uniqueFacilities.sort(
      (a, b) =>
        String(a[1]).localeCompare(
          String(b[1])
        )
    );
  }, [reviews]);

  /*
   * =========================================================
   * FILTER + SEARCH + SORT
   * =========================================================
   */

  const filteredReviews =
    useMemo(() => {
      let result = [...reviews];

      const search =
        searchText
          .trim()
          .toLowerCase();

      /*
       * Search
       */

      if (search) {
        result =
          result.filter(
            (review) =>
              review.facilityName
                ?.toLowerCase()
                .includes(search) ||
              review.memberName
                ?.toLowerCase()
                .includes(search) ||
              review.commentText
                ?.toLowerCase()
                .includes(search)
          );
      }

      /*
       * Rating
       */

      if (
        ratingFilter !== "all"
      ) {
        result =
          result.filter(
            (review) =>
              Number(
                review.rating
              ) ===
              Number(
                ratingFilter
              )
          );
      }

      /*
       * Facility
       */

      if (
        facilityFilter !== "all"
      ) {
        result =
          result.filter(
            (review) =>
              String(
                review.facilityId
              ) ===
              String(
                facilityFilter
              )
          );
      }

      /*
       * Sort
       */

      result.sort((a, b) => {
        if (
          sortBy === "newest"
        ) {
          return (
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
          );
        }

        if (
          sortBy === "oldest"
        ) {
          return (
            new Date(
              a.createdAt
            ).getTime() -
            new Date(
              b.createdAt
            ).getTime()
          );
        }

        if (
          sortBy === "highest"
        ) {
          return (
            Number(b.rating) -
            Number(a.rating)
          );
        }

        if (
          sortBy === "lowest"
        ) {
          return (
            Number(a.rating) -
            Number(b.rating)
          );
        }

        return 0;
      });

      return result;
    }, [
      reviews,
      searchText,
      sortBy,
      ratingFilter,
      facilityFilter,
    ]);

  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReviews.length /
      REVIEWS_PER_PAGE
    )
  );

  const paginatedReviews =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        REVIEWS_PER_PAGE;

      return filteredReviews.slice(
        start,
        start + REVIEWS_PER_PAGE
      );
    }, [
      filteredReviews,
      currentPage,
    ]);

  /*
   * Keep current page valid.
   */

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /*
   * Reset pagination whenever
   * search/filter changes.
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchText,
    sortBy,
    ratingFilter,
    facilityFilter,
  ]);

  /*
   * =========================================================
   * FILTER HELPERS
   * =========================================================
   */

  const clearFilters = () => {
    setSearchText("");
    setSortBy("newest");
    setRatingFilter("all");
    setFacilityFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchText.trim() !== "" ||
    sortBy !== "newest" ||
    ratingFilter !== "all" ||
    facilityFilter !== "all";

  /*
   * =========================================================
   * DATE FORMAT
   * =========================================================
   */

  const formatDate = (
    dateValue: string
  ) => {
    if (!dateValue) return "";

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * =========================================================
   * BOOKING DATE FORMAT
   * =========================================================
   */

  const formatBookingDate = (
    dateValue: string
  ) => {
    if (!dateValue) return "";

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * =========================================================
   * CHECK BOOKING COMPLETED
   * =========================================================
   */

  const isBookingCompleted = (
    booking: ReviewableBooking
  ) => {
    if (
      !booking.bookingDate ||
      !booking.endTime
    ) {
      return true;
    }

    const datePart =
      String(
        booking.bookingDate
      ).split("T")[0];

    const timePart =
      String(
        booking.endTime
      ).slice(0, 5);

    const bookingEnd =
      new Date(
        `${datePart}T${timePart}:00`
      );

    if (
      Number.isNaN(
        bookingEnd.getTime()
      )
    ) {
      return true;
    }

    return (
      bookingEnd.getTime() <=
      Date.now()
    );
  };

  /*
   * =========================================================
   * FIND EXISTING REVIEW FOR BOOKING
   * =========================================================
   *
   * We first check reviewId.
   *
   * If reviewId is missing from the booking API,
   * we fall back to:
   *
   * current member + facility
   *
   * This fixes the issue shown in your screenshot.
   * =========================================================
   */

  const getExistingReviewForBooking =
    (
      booking: ReviewableBooking
    ): Review | null => {
      /*
       * Best case:
       * booking already contains reviewId.
       */

      if (booking.reviewId) {
        const reviewById =
          reviews.find(
            (review) =>
              Number(
                review.reviewId
              ) ===
              Number(
                booking.reviewId
              )
          );

        if (reviewById) {
          return reviewById;
        }
      }

      /*
       * Fallback:
       * Find review belonging to
       * current member + facility.
       */

      if (
        currentMemberId !== null
      ) {
        const reviewByFacility =
          reviews.find(
            (review) =>
              Number(
                review.memberId
              ) ===
              Number(
                currentMemberId
              ) &&
              Number(
                review.facilityId
              ) ===
              Number(
                booking.facilityId
              )
          );

        if (reviewByFacility) {
          return reviewByFacility;
        }
      }

      return null;
    };

  /*
   * =========================================================
   * OPEN CREATE REVIEW MODAL
   * =========================================================
   */

  const openCreateModal = (
    booking: ReviewableBooking
  ) => {
    setSelectedBooking({
      ...booking,
      reviewId: null,
    });

    setRating(5);
    setCommentText("");

    setModalOpen(true);
  };

  /*
   * =========================================================
   * OPEN EDIT REVIEW MODAL
   * =========================================================
   */

  const openEditModal = (
    booking: ReviewableBooking,
    review: Review
  ) => {
    /*
     * Attach the real reviewId to the booking.
     * This is important when booking API didn't
     * return reviewId.
     */

    setSelectedBooking({
      ...booking,
      reviewId:
        review.reviewId,
      rating:
        Number(review.rating),
      commentText:
        review.commentText || "",
    });

    setRating(
      Number(review.rating)
    );

    setCommentText(
      review.commentText || ""
    );

    setDetailsModalOpen(false);
    setModalOpen(true);
  };

  /*
   * =========================================================
   * OPEN VIEW REVIEW MODAL
   * =========================================================
   */

  const openViewModal = (
    review: Review
  ) => {
    setSelectedReview(review);
    setDetailsModalOpen(true);
  };

  /*
   * =========================================================
   * FIND BOOKING FOR REVIEW
   * =========================================================
   */

  const getBookingForReview = (
    review: Review
  ) => {
    /*
     * First try exact reviewId.
     */

    const byReviewId =
      reviewableBookings.find(
        (booking) =>
          booking.reviewId &&
          Number(
            booking.reviewId
          ) ===
          Number(
            review.reviewId
          )
      );

    if (byReviewId) {
      return byReviewId;
    }

    /*
     * Fallback to facility.
     */

    return reviewableBookings.find(
      (booking) =>
        Number(
          booking.facilityId
        ) ===
        Number(
          review.facilityId
        )
    );
  };

  /*
   * =========================================================
   * EDIT FROM VIEW MODAL
   * =========================================================
   */

  const editFromDetails =
    () => {
      if (!selectedReview) {
        return;
      }

      const booking =
        getBookingForReview(
          selectedReview
        );

      if (booking) {
        openEditModal(
          booking,
          selectedReview
        );
        return;
      }

      /*
       * Fallback booking object if
       * reviewable booking isn't found.
       */

      const fallbackBooking: ReviewableBooking =
      {
        bookingId: 0,
        facilityId:
          selectedReview.facilityId,
        facilityName:
          selectedReview.facilityName,
        location: "",
        bookingDate:
          selectedReview.createdAt,
        startTime: "",
        endTime: "",
        reviewId:
          selectedReview.reviewId,
        rating:
          selectedReview.rating,
        commentText:
          selectedReview.commentText,
      };

      openEditModal(
        fallbackBooking,
        selectedReview
      );
    };

  /*
   * =========================================================
   * CLOSE CREATE / EDIT MODAL
   * =========================================================
   */

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModalOpen(false);
    setSelectedBooking(null);
    setRating(5);
    setCommentText("");
  };

  /*
   * =========================================================
   * CLOSE DETAILS MODAL
   * =========================================================
   */

  const closeDetailsModal = () => {
    if (submitting) {
      return;
    }

    setDetailsModalOpen(false);
    setSelectedReview(null);
  };

  /*
   * =========================================================
   * SUBMIT REVIEW
   * =========================================================
   */

  const handleSubmitReview = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedBooking) {
      return;
    }

    const trimmedComment =
      commentText.trim();

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      alert(
        "Please select a rating between 1 and 5."
      );

      return;
    }

    if (
      trimmedComment.length > 500
    ) {
      alert(
        "Your review cannot be longer than 500 characters."
      );

      return;
    }

    try {
      setSubmitting(true);

      /*
       * EDIT
       */

      if (selectedBooking.reviewId) {
        await updateReview(
          selectedBooking.reviewId,
          {
            rating,
            commentText:
              trimmedComment,
          }
        );
      }

      /*
       * CREATE
       */

      else {
        await createReview({
          facilityId:
            selectedBooking.facilityId,
          rating,
          commentText:
            trimmedComment,
        });
      }

      setModalOpen(false);
      setSelectedBooking(null);

      setRating(5);
      setCommentText("");

      /*
       * Refresh both sides.
       */

      await Promise.all([
        loadReviews(),
        loadReviewableBookings(),
      ]);
    } catch (error: any) {
      console.error(
        "Failed to save review:",
        error
      );

      alert(
        error?.message ||
        "Unable to save your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * =========================================================
   * DELETE REVIEW
   * =========================================================
   */

  const handleDeleteReview =
    async (
      review: Review
    ) => {
      if (
        !currentMemberId
      ) {
        return;
      }

      /*
       * Security check on frontend.
       * Backend should also enforce ownership.
       */

      if (
        Number(
          review.memberId
        ) !==
        Number(
          currentMemberId
        )
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteReview(
          review.reviewId
        );

        setDetailsModalOpen(
          false
        );

        setSelectedReview(null);

        await Promise.all([
          loadReviews(),
          loadReviewableBookings(),
        ]);
      } catch (error: any) {
        console.error(
          "Failed to delete review:",
          error
        );

        alert(
          error?.message ||
          "Unable to delete the review. Please try again."
        );
      }
    };

  /*
   * =========================================================
   * STAR COMPONENT
   * =========================================================
   */

  const RatingStars = ({
    value,
    size = 18,
  }: {
    value: number;
    size?: number;
  }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(
          (starNumber) => (
            <Star
              key={starNumber}
              size={size}
              className={
                starNumber <=
                  Number(value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }
            />
          )
        )}
      </div>
    );
  };

  /*
   * =========================================================
   * LOGIN PROMPT
   * =========================================================
   */

  const LoginPrompt = () => {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <MessageSquare
              size={19}
              className="text-indigo-600"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Want to share your experience?
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Sign in to review facilities you
              have already used.
            </p>

            <a
              href="/login"
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              Sign In to Review
            </a>
          </div>
        </div>
      </div>
    );
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reviews & Experiences
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            See what other members think and share your experience with the community.
          </p>

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* =================================================
              LEFT — COMMUNITY REVIEWS
          ================================================= */}

          <section className="min-w-0">

            {/* Heading */}

            <div className="mb-4">
              <p className="mt-1 text-xs text-slate-500">
                {filteredReviews.length}{" "}
                {filteredReviews.length ===
                  1
                  ? "review"
                  : "reviews"}{" "}
                found
              </p>
            </div>

            {/* =================================================
                SEARCH + FILTERS
            ================================================= */}

            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

              <div className="flex flex-col gap-2 sm:flex-row">

                {/* Search */}

                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                    placeholder="Search reviews..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Filter */}

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      (value) =>
                        !value
                    )
                  }
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold transition ${showFilters ||
                    hasActiveFilters
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <Filter
                    size={15}
                  />

                  Filters

                  {hasActiveFilters && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                      !
                    </span>
                  )}
                </button>
              </div>

              {/* Filter options */}

              {showFilters && (
                <div className="mt-3 border-t border-slate-100 pt-3">

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">

                    {/* Sort */}

                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Sort By
                      </label>

                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target
                              .value as SortOption
                          )
                        }
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="newest">
                          Newest First
                        </option>

                        <option value="oldest">
                          Oldest First
                        </option>

                        <option value="highest">
                          Highest Rating
                        </option>

                        <option value="lowest">
                          Lowest Rating
                        </option>
                      </select>
                    </div>

                    {/* Rating */}

                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Rating
                      </label>

                      <select
                        value={
                          ratingFilter
                        }
                        onChange={(e) =>
                          setRatingFilter(
                            e.target
                              .value
                          )
                        }
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="all">
                          All Ratings
                        </option>

                        <option value="5">
                          5 Stars
                        </option>

                        <option value="4">
                          4 Stars
                        </option>

                        <option value="3">
                          3 Stars
                        </option>

                        <option value="2">
                          2 Stars
                        </option>

                        <option value="1">
                          1 Star
                        </option>
                      </select>
                    </div>

                    {/* Facility */}

                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Facility
                      </label>

                      <select
                        value={
                          facilityFilter
                        }
                        onChange={(e) =>
                          setFacilityFilter(
                            e.target
                              .value
                          )
                        }
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="all">
                          All Facilities
                        </option>

                        {facilities.map(
                          ([
                            facilityId,
                            facilityName,
                          ]) => (
                            <option
                              key={
                                facilityId
                              }
                              value={
                                facilityId
                              }
                            >
                              {
                                facilityName
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <X
                          size={13}
                        />
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                COMMUNITY REVIEW LIST
            ================================================= */}

            {loadingReviews ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                <p className="mt-3 text-xs text-slate-500">
                  Loading reviews...
                </p>
              </div>
            ) : paginatedReviews.length ===
              0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <MessageSquare
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  No reviews found
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search
                  or filters.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">

                {paginatedReviews.map(
                  (review) => {
                    const isOwnReview =
                      isLoggedInMember &&
                      currentMemberId !==
                      null &&
                      Number(
                        review.memberId
                      ) ===
                      Number(
                        currentMemberId
                      );

                    const matchingBooking =
                      getBookingForReview(
                        review
                      );

                    return (
                      <article
                        key={
                          review.reviewId
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:shadow-md"
                      >

                        {/* Top */}

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <div className="flex items-center justify-between gap-3">

                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {
                                  review.facilityName
                                }
                              </h3>

                              <span className="shrink-0 text-[10px] text-slate-400">
                                {formatDate(
                                  review.createdAt
                                )}
                              </span>

                            </div>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                              Reviewed by{" "}
                              <span className="font-semibold text-slate-700">
                                {
                                  review.memberName
                                }
                              </span>
                            </p>

                          </div>

                        </div>

                        {/* Rating */}

                        <div className="mt-2 flex items-center gap-2">
                          <RatingStars
                            value={Number(
                              review.rating
                            )}
                            size={15}
                          />

                          <span className="text-xs font-semibold text-slate-600">
                            {Number(
                              review.rating
                            ).toFixed(1)}
                          </span>
                        </div>

                        {/* Comment */}

                        {review.commentText && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                            “
                            {
                              review.commentText
                            }
                            ”
                          </p>
                        )}

                        {/* Own review actions */}

                        {isOwnReview && (
                          <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2.5">

                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  review
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <Eye
                                size={12}
                              />
                              View
                            </button>

                            {matchingBooking && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    matchingBooking,
                                    review
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <Pencil
                                  size={12}
                                />
                                Edit
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteReview(
                                  review
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={12}
                              />
                              Delete
                            </button>

                          </div>
                        )}

                      </article>
                    );
                  }
                )}

              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loadingReviews &&
              filteredReviews.length >
              REVIEWS_PER_PAGE && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">

                  <p className="text-[11px] text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {(
                        (currentPage -
                          1) *
                        REVIEWS_PER_PAGE +
                        1
                      )}
                    </span>{" "}
                    -
                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        currentPage *
                        REVIEWS_PER_PAGE,
                        filteredReviews.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        filteredReviews.length
                      }
                    </span>
                  </p>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={15}
                      />
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold transition ${currentPage ===
                            page
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight
                        size={15}
                      />
                    </button>

                  </div>
                </div>
              )}

          </section>

          {/* =================================================
              RIGHT — MY REVIEWS
          ================================================= */}

          <aside className="lg:sticky lg:top-6">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Reviews
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage reviews for facilities you
                have used.
              </p>
            </div>

            <div className="mt-4">

              {!isLoggedInMember ? (
                <LoginPrompt />
              ) : loadingBookings ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">

                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                  <p className="mt-2 text-xs text-slate-500">
                    Loading your bookings...
                  </p>

                </div>
              ) : reviewableBookings.length ===
                0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <CalendarDays
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900">
                    No completed bookings
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Once you complete a booking,
                    you can share your experience
                    here.
                  </p>

                </div>
              ) : (

                /*
                 * =================================================
                 * COMPACT MY REVIEWS LIST
                 * =================================================
                 */

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {reviewableBookings.map(
                    (
                      booking,
                      index
                    ) => {
                      const completed =
                        isBookingCompleted(
                          booking
                        );

                      const existingReview =
                        getExistingReviewForBooking(
                          booking
                        );

                      /*
                       * If booking is not completed,
                       * don't allow reviewing yet.
                       */

                      return (
                        <div
                          key={
                            booking.bookingId
                          }
                          className={`px-4 py-3.5 ${index !==
                            reviewableBookings.length -
                            1
                            ? "border-b border-slate-100"
                            : ""
                            }`}
                        >

                          {/* =================================================
                              TITLE + STATUS
                          ================================================= */}

                          <div className="flex items-start justify-between gap-2.5">

                            <div className="min-w-0">

                              <h3 className="truncate text-sm font-bold text-slate-900">
                                {
                                  booking.facilityName
                                }
                              </h3>

                              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">

                                <CalendarDays
                                  size={12}
                                />

                                <span>
                                  {formatBookingDate(
                                    booking.bookingDate
                                  )}
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {
                                    booking.startTime
                                  }{" "}
                                  -{" "}
                                  {
                                    booking.endTime
                                  }
                                </span>

                              </div>

                            </div>

                            {/* Status */}

                            {existingReview ? (

                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">

                                <CheckCircle2
                                  size={
                                    11
                                  }
                                />

                                Reviewed

                              </span>

                            ) : completed ? (

                              <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">
                                Pending
                              </span>

                            ) : (

                              <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">
                                Upcoming
                              </span>

                            )}

                          </div>

                          {/* =================================================
                              LOCATION
                          ================================================= */}

                          {booking.location && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400">

                              <MapPin
                                size={11}
                              />

                              <span className="truncate">
                                {
                                  booking.location
                                }
                              </span>

                            </div>
                          )}

                          {/* =================================================
                              EXISTING REVIEW RATING
                          ================================================= */}

                          {existingReview && (
                            <div className="mt-2 flex items-center gap-1.5">

                              <RatingStars
                                value={Number(
                                  existingReview.rating
                                )}
                                size={13}
                              />

                              <span className="text-[10px] font-semibold text-slate-600">
                                {Number(
                                  existingReview.rating
                                ).toFixed(
                                  1
                                )}
                              </span>

                            </div>
                          )}

                          {/* =================================================
                              ACTIONS
                          ================================================= */}

                          {existingReview ? (

                            /*
                             * ALREADY REVIEWED
                             */

                            <div className="mt-2.5 flex gap-1.5">

                              <button
                                type="button"
                                onClick={() =>
                                  openViewModal(
                                    existingReview
                                  )
                                }
                                className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
                              >
                                <Eye
                                  size={
                                    12
                                  }
                                />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    booking,
                                    existingReview
                                  )
                                }
                                className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-indigo-100 bg-white text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <Pencil
                                  size={
                                    12
                                  }
                                />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteReview(
                                    existingReview
                                  )
                                }
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
                                aria-label="Delete review"
                              >
                                <Trash2
                                  size={
                                    12
                                  }
                                />
                              </button>

                            </div>

                          ) : completed ? (

                            /*
                             * COMPLETED BUT NOT REVIEWED
                             */

                            <button
                              type="button"
                              onClick={() =>
                                openCreateModal(
                                  booking
                                )
                              }
                              className="mt-2.5 flex h-8 w-full items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-semibold text-white transition hover:bg-indigo-700"
                            >
                              Write a Review
                            </button>

                          ) : (

                            /*
                             * UPCOMING
                             */

                            <button
                              type="button"
                              disabled
                              className="mt-2.5 flex h-8 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-400"
                            >
                              Review After Booking
                            </button>

                          )}

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>
          </aside>

        </div>
      </main>

      {/* =====================================================
          VIEW REVIEW DETAILS MODAL
      ===================================================== */}

      {detailsModalOpen &&
        selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Your Review
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {
                      selectedReview.facilityName
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeDetailsModal
                  }
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>

              </div>

              {/* Body */}

              <div className="px-5 py-5">

                {/* Facility */}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Facility
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {
                      selectedReview.facilityName
                    }
                  </p>
                </div>

                {/* Rating */}

                <div className="mt-5">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Rating
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <RatingStars
                      value={Number(
                        selectedReview.rating
                      )}
                      size={21}
                    />

                    <span className="text-sm font-bold text-slate-700">
                      {Number(
                        selectedReview.rating
                      ).toFixed(1)}
                    </span>

                  </div>

                </div>

                {/* Comment */}

                <div className="mt-5">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Your Review
                  </p>

                  <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3.5">

                    {selectedReview.commentText ? (
                      <p className="text-sm leading-6 text-slate-600">
                        “
                        {
                          selectedReview.commentText
                        }
                        ”
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">
                        No written comment.
                      </p>
                    )}

                  </div>

                </div>

                {/* Date */}

                <div className="mt-5">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Reviewed On
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {formatDate(
                      selectedReview.createdAt
                    )}
                  </p>

                </div>

                {/* Actions */}

                <div className="mt-6 flex gap-2">

                  <button
                    type="button"
                    onClick={
                      editFromDetails
                    }
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Pencil
                      size={14}
                    />
                    Edit Review
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteReview(
                        selectedReview
                      )
                    }
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2
                      size={14}
                    />
                    Delete
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}

      {/* =====================================================
          CREATE / EDIT REVIEW MODAL
      ===================================================== */}

      {modalOpen &&
        selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedBooking.reviewId
                      ? "Edit Your Review"
                      : "Write a Review"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      selectedBooking.facilityName
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Form */}

              <form
                onSubmit={
                  handleSubmitReview
                }
                className="px-6 py-6"
              >

                {/* Rating */}

                <div>

                  <label className="block text-sm font-semibold text-slate-800">
                    Your Rating
                  </label>

                  <div className="mt-3 flex items-center gap-1">

                    {[1, 2, 3, 4, 5].map(
                      (
                        starNumber
                      ) => (
                        <button
                          key={
                            starNumber
                          }
                          type="button"
                          onClick={() =>
                            setRating(
                              starNumber
                            )
                          }
                          className="rounded-md p-1 transition hover:bg-amber-50"
                          aria-label={`${starNumber} star`}
                        >
                          <Star
                            size={29}
                            className={
                              starNumber <=
                                rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      )
                    )}

                    <span className="ml-2 text-sm font-semibold text-slate-600">
                      {rating}.0
                    </span>

                  </div>

                </div>

                {/* Comment */}

                <div className="mt-6">

                  <div className="flex items-center justify-between">

                    <label
                      htmlFor="review-comment"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Your Review
                    </label>

                    <span
                      className={`text-xs ${commentText.length >
                        500
                        ? "text-red-600"
                        : "text-slate-400"
                        }`}
                    >
                      {
                        commentText.length
                      }
                      /500
                    </span>

                  </div>

                  <textarea
                    id="review-comment"
                    value={
                      commentText
                    }
                    onChange={(e) =>
                      setCommentText(
                        e.target
                          .value
                      )
                    }
                    maxLength={500}
                    rows={5}
                    placeholder="Tell other members about your experience..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

                {/* Actions */}

                <div className="mt-6 flex gap-3">

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    disabled={
                      submitting
                    }
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      commentText.length >
                      500
                    }
                    className="h-11 flex-1 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Saving..."
                      : selectedBooking.reviewId
                        ? "Update Review"
                        : "Submit Review"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
};

export default Reviews;