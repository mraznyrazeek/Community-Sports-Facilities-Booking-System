import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  CalendarCheck,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  UserPlus,
  Star,
  MessageCircle,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import {
  getFacilities,
  getSports,
  getBookings,
  getMembers,
  getReviews,
  getInquiries,
  type Booking,
  type Member,
  type Review,
  type Inquiry,
} from "../services/api";

import LoadingSpinner from "../components/common/LoadingSpinner";
import StatCard from "../components/common/StatCard";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";


/* =========================================================
   TYPES
========================================================= */

type ActivityType =
  | "booking"
  | "member"
  | "review"
  | "inquiry";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
};


/* =========================================================
   DATE HELPERS
========================================================= */

/*
 * Converts the API booking date + start time into a LOCAL
 * JavaScript Date.
 *
 * Handles examples such as:
 *
 * bookingDate = "2026-08-26"
 * startTime   = "18:00:00"
 *
 * bookingDate = "2026-08-26T00:00:00"
 * startTime   = "18:00:00"
 *
 * bookingDate = "2026-08-26T00:00:00.000Z"
 * startTime   = "18:00"
 */
function getBookingDateTime(
  bookingDate: string,
  startTime: string
): Date | null {

  if (!bookingDate || !startTime) {
    return null;
  }

  try {

    // Take only YYYY-MM-DD from the API date.
    const datePart =
      bookingDate.substring(0, 10);

    const [year, month, day] =
      datePart.split("-").map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return null;
    }

    // Remove milliseconds if present.
    const cleanTime =
      startTime
        .split(".")[0]
        .trim();

    const timeParts =
      cleanTime.split(":");

    const hours =
      Number(timeParts[0] || 0);

    const minutes =
      Number(timeParts[1] || 0);

    const seconds =
      Number(timeParts[2] || 0);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(seconds)
    ) {
      return null;
    }

    /*
     * IMPORTANT:
     *
     * Using the Date constructor with separate values
     * creates the date in the user's LOCAL timezone.
     *
     * This avoids timezone problems caused by:
     * new Date("2026-08-26T18:00:00")
     */
    return new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );

  } catch {
    return null;
  }
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatBookingDate(
  bookingDate: string
): string {

  if (!bookingDate) {
    return "Unknown date";
  }

  const datePart =
    bookingDate.substring(0, 10);

  const [year, month, day] =
    datePart.split("-").map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return bookingDate;
  }

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatBookingTime(
  time: string
): string {

  if (!time) {
    return "";
  }

  const parts =
    time.split(":");

  const hours =
    Number(parts[0] || 0);

  const minutes =
    Number(parts[1] || 0);

  const date =
    new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
}


/* =========================================================
   STATUS STYLES
========================================================= */

function getBookingStatusStyles(
  status: string
) {

  switch (
    status?.toLowerCase()
  ) {

    case "confirmed":
      return {
        wrapper:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot:
          "bg-emerald-500",
      };

    case "pending":
      return {
        wrapper:
          "bg-amber-50 text-amber-700 border-amber-200",
        dot:
          "bg-amber-500",
      };

    case "cancelled":
      return {
        wrapper:
          "bg-red-50 text-red-600 border-red-200",
        dot:
          "bg-red-500",
      };

    default:
      return {
        wrapper:
          "bg-gray-50 text-gray-600 border-gray-200",
        dot:
          "bg-gray-400",
      };
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

  const [stats, setStats] =
    useState({
      facilities: 0,
      sports: 0,
      bookings: 0,
      members: 0,
    });

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [members, setMembers] =
    useState<Member[]>([]);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [inquiries, setInquiries] =
    useState<Inquiry[]>([]);

  const [loading, setLoading] =
    useState(true);


  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {

    async function loadDashboard() {

      try {

        const [
          facilitiesData,
          sportsData,
          bookingsData,
          membersData,
          reviewsData,
          inquiriesData,
        ] = await Promise.all([
          getFacilities(),
          getSports(),
          getBookings(),
          getMembers(),
          getReviews(),
          getInquiries(),
        ]);


        /* ===============================================
           STATS
        =============================================== */

        setStats({
          facilities:
            facilitiesData?.length || 0,

          sports:
            sportsData?.length || 0,

          bookings:
            bookingsData?.length || 0,

          members:
            membersData?.length || 0,
        });


        /* ===============================================
           SAVE DATA
        =============================================== */

        setBookings(
          bookingsData || []
        );

        setMembers(
          membersData || []
        );

        setReviews(
          reviewsData || []
        );

        setInquiries(
          inquiriesData || []
        );


      } catch (error) {

        console.error(
          "Dashboard loading error:",
          error
        );

      } finally {

        setLoading(false);

      }

    }

    loadDashboard();

  }, []);


  /* =======================================================
     UPCOMING BOOKINGS
  ======================================================= */

  const upcomingBookings =
    useMemo(() => {

      const now =
        new Date();

      return bookings

        .filter((booking) => {

          /*
           * Cancelled bookings should never appear.
           */
          if (
            booking.status
              ?.toLowerCase() ===
            "cancelled"
          ) {
            return false;
          }


          const bookingDateTime =
            getBookingDateTime(
              booking.bookingDate,
              booking.startTime
            );


          if (!bookingDateTime) {
            return false;
          }


          /*
           * Only future bookings.
           *
           * This also correctly handles:
           * today at 09:00
           * today at 18:00
           * tomorrow
           * future dates
           */
          return (
            bookingDateTime.getTime() >=
            now.getTime()
          );

        })

        .sort((a, b) => {

          const dateA =
            getBookingDateTime(
              a.bookingDate,
              a.startTime
            );

          const dateB =
            getBookingDateTime(
              b.bookingDate,
              b.startTime
            );


          if (!dateA || !dateB) {
            return 0;
          }


          return (
            dateA.getTime() -
            dateB.getTime()
          );

        })

        .slice(0, 5);

    }, [bookings]);


  /* =======================================================
     MONTH NAMES
  ======================================================= */

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];


  /* =======================================================
     LAST 12 MONTHS
  ======================================================= */

  const last12Months =
    useMemo(() => {

      const months: {
        key: string;
        label: string;
        year: number;
        month: number;
      }[] = [];

      const now =
        new Date();


      for (
        let i = 11;
        i >= 0;
        i--
      ) {

        const date =
          new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
          );


        months.push({

          key:
            `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`,

          label:
            monthNames[
              date.getMonth()
            ],

          year:
            date.getFullYear(),

          month:
            date.getMonth(),

        });

      }


      return months;

    }, []);


  /* =======================================================
     MONTHLY BOOKINGS
  ======================================================= */

  const monthlyBookings =
    useMemo(() => {

      return last12Months.map(
        (month) => {

          const count =
            bookings.filter(
              (booking) => {

                if (
                  !booking.bookingDate
                ) {
                  return false;
                }


                const datePart =
                  booking.bookingDate
                    .substring(0, 10);


                const [
                  year,
                  monthNumber,
                ] =
                  datePart
                    .split("-")
                    .map(Number);


                return (
                  year === month.year &&
                  monthNumber - 1 ===
                    month.month
                );

              }
            ).length;


          return {
            month:
              month.label,

            bookings:
              count,
          };

        }
      );

    }, [
      bookings,
      last12Months,
    ]);


  /* =======================================================
     MONTHLY MEMBERS
  ======================================================= */

  const monthlyMembers =
    useMemo(() => {

      return last12Months.map(
        (month) => {

          const count =
            members.filter(
              (member) => {

                if (
                  !member.createdAt
                ) {
                  return false;
                }


                const date =
                  new Date(
                    member.createdAt
                  );


                return (
                  date.getFullYear() ===
                    month.year &&
                  date.getMonth() ===
                    month.month
                );

              }
            ).length;


          return {
            month:
              month.label,

            members:
              count,
          };

        }
      );

    }, [
      members,
      last12Months,
    ]);


  /* =======================================================
     CHART TOTALS
  ======================================================= */

  const bookingChartTotal =
    monthlyBookings.reduce(
      (
        total,
        item
      ) =>
        total +
        item.bookings,
      0
    );


  const memberChartTotal =
    monthlyMembers.reduce(
      (
        total,
        item
      ) =>
        total +
        item.members,
      0
    );


  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  const recentActivities =
    useMemo<Activity[]>(() => {

      const activities:
        Activity[] = [];


      /* BOOKINGS */

      bookings.forEach(
        (booking) => {

          activities.push({

            id:
              `booking-${booking.bookingId}`,

            type:
              "booking",

            title:
              "New Booking",

            description:
              booking.facility
                ?.facilityName ||
              "Facility booking",

            date:
              booking.createdAt,

          });

        }
      );


      /* MEMBERS */

      members.forEach(
        (member) => {

          activities.push({

            id:
              `member-${member.memberId}`,

            type:
              "member",

            title:
              "New Member",

            description:
              member.name ||
              "New community member",

            date:
              member.createdAt,

          });

        }
      );


      /* REVIEWS */

      reviews.forEach(
        (review) => {

          activities.push({

            id:
              `review-${review.reviewId}`,

            type:
              "review",

            title:
              "New Review",

            description:
              review.facilityName ||
              "Facility review",

            date:
              review.createdAt,

          });

        }
      );


      /* INQUIRIES */

      inquiries.forEach(
        (inquiry) => {

          activities.push({

            id:
              `inquiry-${inquiry.inquiryId}`,

            type:
              "inquiry",

            title:
              "New Inquiry",

            description:
              inquiry.subject ||
              "Member inquiry",

            date:
              inquiry.createdAt,

          });

        }
      );


      return activities
        .filter(
          (activity) =>
            activity.date
        )
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        )
        .slice(0, 5);

    }, [
      bookings,
      members,
      reviews,
      inquiries,
    ]);


  /* =======================================================
     ACTIVITY ICON
  ======================================================= */

  const getActivityIcon = (
    type: ActivityType
  ) => {

    switch (type) {

      case "booking":
        return (
          <CalendarCheck
            size={17}
          />
        );

      case "member":
        return (
          <UserPlus
            size={17}
          />
        );

      case "review":
        return (
          <Star
            size={17}
          />
        );

      case "inquiry":
        return (
          <MessageCircle
            size={17}
          />
        );

      default:
        return (
          <Clock
            size={17}
          />
        );

    }

  };


  /* =======================================================
     ACTIVITY STYLE
  ======================================================= */

  const getActivityStyles = (
    type: ActivityType
  ) => {

    switch (type) {

      case "booking":
        return {
          wrapper:
            "bg-blue-50 text-blue-600",
          badge:
            "bg-blue-50 text-blue-600",
        };

      case "member":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-600",
          badge:
            "bg-emerald-50 text-emerald-600",
        };

      case "review":
        return {
          wrapper:
            "bg-amber-50 text-amber-600",
          badge:
            "bg-amber-50 text-amber-600",
        };

      case "inquiry":
        return {
          wrapper:
            "bg-purple-50 text-purple-600",
          badge:
            "bg-purple-50 text-purple-600",
        };

      default:
        return {
          wrapper:
            "bg-slate-50 text-slate-600",
          badge:
            "bg-slate-50 text-slate-600",
        };

    }

  };


  /* =======================================================
     ACTIVITY LABEL
  ======================================================= */

  const getActivityLabel = (
    type: ActivityType
  ) => {

    switch (type) {

      case "booking":
        return "Booking";

      case "member":
        return "Member";

      case "review":
        return "Review";

      case "inquiry":
        return "Inquiry";

      default:
        return "Activity";

    }

  };


  /* =======================================================
     RELATIVE TIME
  ======================================================= */

  const getRelativeTime = (
    date: string
  ) => {

    if (!date) {
      return "";
    }


    const now =
      new Date().getTime();

    const activityDate =
      new Date(date).getTime();

    const difference =
      now -
      activityDate;


    if (difference < 0) {
      return "Just now";
    }


    const seconds =
      Math.floor(
        difference / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );


    if (seconds < 60) {
      return "Just now";
    }


    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }


    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }


    if (days < 7) {
      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  /* =======================================================
     TOOLTIP
  ======================================================= */

  const BookingTooltip = ({
    active,
    payload,
    label,
  }: any) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }


    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">

        <p className="text-xs font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-900">
          {payload[0].value} bookings
        </p>

      </div>
    );

  };


  const MemberTooltip = ({
    active,
    payload,
    label,
  }: any) => {

    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }


    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">

        <p className="text-xs font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-900">
          {payload[0].value} members
        </p>

      </div>
    );

  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <LoadingSpinner
        text="Loading dashboard..."
      />
    );

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="space-y-7">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div>

        <p className="text-sm font-medium text-blue-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Overview of your community sports
          platform.
        </p>

      </div>


      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Members"
          value={stats.members}
          icon={Users}
          description="Registered community members"
        />

        <StatCard
          title="Facilities"
          value={stats.facilities}
          icon={Building2}
          description="Available sports facilities"
        />

        <StatCard
          title="Sports"
          value={stats.sports}
          icon={Trophy}
          description="Sports available"
        />

        <StatCard
          title="Bookings"
          value={stats.bookings}
          icon={CalendarCheck}
          description="Total facility bookings"
        />

      </div>


      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)]">


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="space-y-5">


          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="grid gap-5 lg:grid-cols-2">


            {/* BOOKINGS CHART */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <CalendarCheck
                        size={16}
                      />
                    </div>

                    <h2 className="text-sm font-bold text-gray-900">
                      Monthly Bookings
                    </h2>

                  </div>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-2xl font-bold text-gray-900">
                      {bookingChartTotal}
                    </span>

                    <span className="mb-0.5 text-xs text-gray-400">
                      last 12 months
                    </span>

                  </div>

                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                  <TrendingUp
                    size={16}
                  />
                </div>

              </div>


              <div className="mt-4 h-[190px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={
                      monthlyBookings
                    }
                    margin={{
                      top: 8,
                      right: 8,
                      left: -22,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eef2f7"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <BookingTooltip />
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        strokeWidth: 2,
                        fill: "#ffffff",
                      }}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* MEMBERS CHART */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Users
                        size={16}
                      />
                    </div>

                    <h2 className="text-sm font-bold text-gray-900">
                      Members Joined
                    </h2>

                  </div>

                  <div className="mt-3 flex items-end gap-2">

                    <span className="text-2xl font-bold text-gray-900">
                      {memberChartTotal}
                    </span>

                    <span className="mb-0.5 text-xs text-gray-400">
                      last 12 months
                    </span>

                  </div>

                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                  <TrendingUp
                    size={16}
                  />
                </div>

              </div>


              <div className="mt-4 h-[190px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={
                      monthlyMembers
                    }
                    margin={{
                      top: 8,
                      right: 8,
                      left: -22,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eef2f7"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "#94a3b8",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <MemberTooltip />
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="members"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        strokeWidth: 2,
                        fill: "#ffffff",
                      }}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>


          {/* =================================================
              UPCOMING BOOKINGS
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg font-bold text-gray-900">
                    Upcoming Bookings
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                    Next 5
                  </span>

                </div>

                <p className="mt-1 text-xs text-gray-500">
                  The next scheduled facility bookings.
                </p>

              </div>


              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CalendarDays
                  size={17}
                />
              </div>

            </div>


            {/* BOOKINGS */}

            {upcomingBookings.length === 0 ? (

              <div className="flex min-h-[250px] items-center justify-center px-5 text-center">

                <div>

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                    <CalendarCheck
                      size={20}
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    No upcoming bookings
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Future bookings will appear here.
                  </p>

                </div>

              </div>

            ) : (

              <div>

                {upcomingBookings.map(
                  (booking) => {

                    const statusStyles =
                      getBookingStatusStyles(
                        booking.status
                      );


                    return (

                      <div
                        key={
                          booking.bookingId
                        }
                        className="group border-b border-gray-100 px-5 py-4 last:border-b-0 transition hover:bg-gray-50/60"
                      >

                        <div className="flex items-center gap-4">


                          {/* DATE ICON */}

                          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                            <CalendarCheck
                              size={17}
                            />

                          </div>


                          {/* MAIN INFO */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center gap-2">

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {booking.facility
                                  ?.facilityName ||
                                  "Facility booking"}
                              </p>

                              <span className="hidden text-xs text-gray-300 sm:inline">
                                •
                              </span>

                              <span className="hidden text-xs text-gray-500 sm:inline">
                                #{booking.bookingId}
                              </span>

                            </div>


                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">

                              <span>
                                {booking.member
                                  ?.name ||
                                  "Unknown member"}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span>
                                {formatBookingDate(
                                  booking.bookingDate
                                )}
                              </span>

                              <span className="text-gray-300">
                                •
                              </span>

                              <span>
                                {formatBookingTime(
                                  booking.startTime
                                )}{" "}
                                -
                                {" "}
                                {formatBookingTime(
                                  booking.endTime
                                )}
                              </span>

                            </div>

                          </div>


                          {/* STATUS */}

                          <div
                            className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:inline-flex ${statusStyles.wrapper}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                            />

                            {booking.status}

                          </div>


                          {/* ARROW */}

                          <ChevronRight
                            size={16}
                            className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500"
                          />

                        </div>


                        {/* MOBILE STATUS */}

                        <div className="mt-3 sm:hidden">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyles.wrapper}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                            />

                            {booking.status}

                          </span>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}


            {/* FOOTER */}

            {upcomingBookings.length > 0 && (

              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-2.5">

                <span className="text-[11px] font-medium text-gray-400">
                  Showing{" "}
                  {upcomingBookings.length}{" "}
                  upcoming{" "}
                  {upcomingBookings.length === 1
                    ? "booking"
                    : "bookings"}
                </span>

                <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  Scheduled

                </span>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


          {/* HEADER */}

          <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">

                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                  Live

                </span>

              </div>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Latest bookings, registrations,
                reviews and inquiries.
              </p>

            </div>


            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">

              <Clock
                size={17}
              />

            </div>

          </div>


          {/* ACTIVITY */}

          {recentActivities.length === 0 ? (

            <div className="flex min-h-[300px] items-center justify-center px-5 text-center">

              <div>

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400">

                  <Clock
                    size={18}
                  />

                </div>

                <p className="mt-3 text-sm font-semibold text-gray-700">
                  No recent activity
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  New activity will appear here.
                </p>

              </div>

            </div>

          ) : (

            <div>

              {recentActivities.map(
                (activity) => {

                  const styles =
                    getActivityStyles(
                      activity.type
                    );


                  return (

                    <div
                      key={
                        activity.id
                      }
                      className="group flex items-center gap-3 border-b border-gray-100 px-5 py-3.5 transition hover:bg-gray-50/70"
                    >

                      {/* ICON */}

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.wrapper}`}
                      >

                        {getActivityIcon(
                          activity.type
                        )}

                      </div>


                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {activity.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {activity.description}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}
                          >
                            {getActivityLabel(
                              activity.type
                            )}
                          </span>

                          <span className="text-[11px] text-gray-400">
                            {getRelativeTime(
                              activity.date
                            )}
                          </span>

                        </div>

                      </div>


                      {/* ARROW */}

                      <ChevronRight
                        size={16}
                        className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500"
                      />

                    </div>

                  );

                }
              )}

            </div>

          )}


          {/* FOOTER */}

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-2.5">

            <span className="text-[11px] font-medium text-gray-400">

              Latest{" "}
              {Math.min(
                recentActivities.length,
                5
              )}{" "}
              events

            </span>


            <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              Updated automatically

            </span>

          </div>

        </div>

      </div>

    </div>
  );
}