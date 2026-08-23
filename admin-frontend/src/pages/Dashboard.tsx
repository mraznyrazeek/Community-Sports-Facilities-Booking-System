import { useEffect, useState } from "react";

import {
  Building2,
  CalendarCheck,
  Users,
  Trophy,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import {
  getFacilities,
  getSports,
  getBookings,
  getMembers,
} from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";

export default function Dashboard() {

  const [stats, setStats] = useState({
    facilities: 0,
    sports: 0,
    bookings: 0,
    members: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadDashboard() {

      try {

        const [
          facilities,
          sports,
          bookings,
          members,
        ] = await Promise.all([
          getFacilities(),
          getSports(),
          getBookings(),
          getMembers(),
        ]);

        setStats({
          facilities: facilities?.length || 0,
          sports: sports?.length || 0,
          bookings: bookings?.length || 0,
          members: members?.length || 0,
        });

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

  if (loading) {
    return (
      <LoadingSpinner text="Loading dashboard..." />
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Overview of your community sports platform.
        </p>
      </div>


      {/* STATS */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

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


      {/* QUICK ACTIONS */}

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Platform Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage the most important parts of
                your sports community.
              </p>
            </div>

            <ArrowUpRight
              className="text-gray-300"
              size={24}
            />

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-5">
              <Building2
                className="text-blue-600"
                size={22}
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                Facilities
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add, edit and manage community sports
                facilities.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <Users
                className="text-blue-600"
                size={22}
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                Members
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View and manage registered members.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <CalendarCheck
                className="text-blue-600"
                size={22}
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                Bookings
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage facility bookings.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <Trophy
                className="text-blue-600"
                size={22}
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                Sports
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Manage sports offered by the community.
              </p>
            </div>

          </div>

        </div>


        {/* SYSTEM STATUS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">
            System Status
          </h2>

          <div className="mt-6 space-y-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-green-50 p-2 text-green-600">
                  <span className="block h-2 w-2 rounded-full bg-green-500" />
                </div>

                <span className="text-sm font-medium">
                  API
                </span>

              </div>

              <span className="text-xs font-semibold text-green-600">
                Online
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-green-50 p-2 text-green-600">
                  <span className="block h-2 w-2 rounded-full bg-green-500" />
                </div>

                <span className="text-sm font-medium">
                  Database
                </span>

              </div>

              <span className="text-xs font-semibold text-green-600">
                Connected
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Clock size={16} />
                </div>

                <span className="text-sm font-medium">
                  Environment
                </span>

              </div>

              <span className="text-xs font-semibold text-blue-600">
                Development
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}