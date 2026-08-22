import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Trophy,
  Star,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getBookings,
  getMySports,
  getReviews,
  getCurrentMember,
} from "../services/api";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [sports, setSports] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const member = getCurrentMember();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingsData, sportsData, reviewsData] =
        await Promise.all([
          getBookings(),
          getMySports(),
          getReviews(),
        ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // BOOKING DATA
  // --------------------------------------------------

  const upcomingBookings = useMemo(() => {
    const now = new Date();

    return bookings
      .filter((booking) => {
        const bookingDate =
          booking.bookingDate ||
          booking.date ||
          booking.startDate ||
          booking.createdAt;

        if (!bookingDate) return true;

        const date = new Date(bookingDate);

        return !isNaN(date.getTime()) && date >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.bookingDate ||
            a.date ||
            a.startDate ||
            a.createdAt
        );

        const dateB = new Date(
          b.bookingDate ||
            b.date ||
            b.startDate ||
            b.createdAt
        );

        return dateA - dateB;
      });
  }, [bookings]);

  // --------------------------------------------------
  // REVIEW DATA
  // --------------------------------------------------

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    const ratings = reviews
      .map((review) =>
        Number(
          review.rating ??
            review.Rating ??
            review.stars ??
            0
        )
      )
      .filter((rating) => rating > 0);

    if (!ratings.length) return 0;

    return (
      ratings.reduce((sum, rating) => sum + rating, 0) /
      ratings.length
    ).toFixed(1);
  }, [reviews]);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getBookingName = (booking) => {
    return (
      booking.facility?.facilityName ||
      booking.facilityName ||
      booking.FacilityName ||
      booking.facility?.name ||
      "Sports Facility"
    );
  };

  const getSportName = (booking) => {
    return (
      booking.facility?.sport?.sportName ||
      booking.sport?.sportName ||
      booking.sportName ||
      booking.SportName ||
      "Sports"
    );
  };

  const getBookingLocation = (booking) => {
    return (
      booking.facility?.location ||
      booking.location ||
      booking.Facility?.Location ||
      "Location unavailable"
    );
  };

  const getBookingDate = (booking) => {
    const value =
      booking.bookingDate ||
      booking.date ||
      booking.startDate;

    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const getBookingTime = (booking) => {
    return (
      booking.bookingTime ||
      booking.time ||
      booking.startTime ||
      booking.startDate ||
      "Time unavailable"
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />

          <p className="text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="space-y-7">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 md:p-10 text-white shadow-lg">

        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-white/10" />

        <div className="absolute right-20 -bottom-32 w-80 h-80 rounded-full bg-white/10" />

        <div className="relative z-10 max-w-2xl">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Your sports journey
          </p>

          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            Find your next game.
          </h1>

          <p className="mt-4 text-blue-100 max-w-xl leading-relaxed">
            Discover sports facilities, book your favourite
            venue, and keep track of all your activities in one
            place.
          </p>

          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 mt-7 bg-white text-blue-600 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-sm"
          >
            Explore Facilities
            <ArrowUpRight size={17} />
          </Link>

        </div>
      </section>

      {/* STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* BOOKINGS */}
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Total Bookings"
          value={bookings.length}
          subtitle="All your bookings"
          link="/bookings"
        />

        {/* UPCOMING */}
        <StatCard
          icon={<Clock3 size={20} />}
          label="Upcoming"
          value={upcomingBookings.length}
          subtitle={
            upcomingBookings.length > 0
              ? "Next activities"
              : "No upcoming bookings"
          }
          link="/bookings"
        />

        {/* SPORTS */}
        <StatCard
          icon={<Trophy size={20} />}
          label="Sports Joined"
          value={sports.length}
          subtitle={
            sports.length > 0
              ? sports
                  .slice(0, 2)
                  .map(
                    (item) =>
                      item.sport?.sportName ||
                      item.sportName ||
                      "Sport"
                  )
                  .join(", ")
              : "No sports joined"
          }
          link="/my-sports"
        />

        {/* REVIEWS */}
        <StatCard
          icon={<Star size={20} />}
          label="Reviews"
          value={reviews.length}
          subtitle={
            reviews.length > 0
              ? `${averageRating} average rating`
              : "No reviews yet"
          }
          link="/reviews"
        />

      </section>

      {/* CONTENT */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* UPCOMING BOOKINGS */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">

          <div className="p-6 border-b border-slate-100 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Upcoming Bookings
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your next scheduled activities
              </p>
            </div>

            <Link
              to="/bookings"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="p-4">

            {upcomingBookings.length === 0 ? (

              <div className="py-12 text-center">

                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center">
                  <CalendarDays className="text-blue-600" size={22} />
                </div>

                <h3 className="mt-4 font-medium text-slate-900">
                  No upcoming bookings
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Find a facility and book your next game.
                </p>

                <Link
                  to="/facilities"
                  className="inline-flex mt-5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
                >
                  Explore Facilities
                </Link>

              </div>

            ) : (

              <div className="space-y-3">

                {upcomingBookings
                  .slice(0, 5)
                  .map((booking, index) => (

                    <div
                      key={
                        booking.bookingId ||
                        booking.id ||
                        index
                      }
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition"
                    >

                      {/* ICON */}
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Trophy
                          size={20}
                          className="text-blue-600"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2 flex-wrap">

                          <h3 className="font-semibold text-slate-900 truncate">
                            {getBookingName(booking)}
                          </h3>

                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                            {getSportName(booking)}
                          </span>

                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">

                          <span>
                            📅 {getBookingDate(booking)}
                          </span>

                          <span>
                            🕐 {getBookingTime(booking)}
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {getBookingLocation(booking)}
                          </span>

                        </div>

                      </div>

                      <Link
                        to="/bookings"
                        className="hidden sm:inline-flex px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Details
                      </Link>

                    </div>

                  ))}

              </div>

            )}

          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

          <div className="p-6 border-b border-slate-100">

            <h2 className="font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage your sports activities
            </p>

          </div>

          <div className="p-4 space-y-3">

            <QuickAction
              to="/facilities"
              icon={<CalendarDays size={19} />}
              title="Book a Facility"
              description="Find and reserve a venue"
            />

            <QuickAction
              to="/sports"
              icon={<Trophy size={19} />}
              title="Join a Sport"
              description="Explore available sports"
            />

            <QuickAction
              to="/reviews"
              icon={<Star size={19} />}
              title="Write a Review"
              description="Share your experience"
            />

            <QuickAction
              to="/inquiries"
              icon={<ArrowRight size={19} />}
              title="Contact Support"
              description="Send us an inquiry"
            />

          </div>

        </div>

      </section>

    </div>
  );
};


// ==================================================
// STAT CARD
// ==================================================

const StatCard = ({
  icon,
  label,
  value,
  subtitle,
  link,
}) => {
  return (
    <Link
      to={link}
      className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition"
    >

      <div className="flex items-start justify-between">

        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>

        <ArrowUpRight
          size={17}
          className="text-slate-300 group-hover:text-blue-500 transition"
        />

      </div>

      <p className="text-sm text-slate-500 mt-5">
        {label}
      </p>

      <div className="flex items-end gap-3 mt-1">

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

        <span className="text-xs text-emerald-600 mb-1">
          {subtitle}
        </span>

      </div>

    </Link>
  );
};


// ==================================================
// QUICK ACTION
// ==================================================

const QuickAction = ({
  to,
  icon,
  title,
  description,
}) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/40 transition group"
    >

      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="text-xs text-slate-500 mt-0.5">
          {description}
        </p>

      </div>

      <ArrowRight
        size={17}
        className="text-slate-300 group-hover:text-blue-500 transition"
      />

    </Link>
  );
};

export default Dashboard;