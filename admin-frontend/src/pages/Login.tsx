import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Trophy,
} from "lucide-react";

import {
  isAuthenticated,
  login,
} from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      const role =
        data?.member?.role ??
        data?.member?.Role ??
        "";

      if (
        String(role).trim().toLowerCase() !== "admin"
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminMember");

        throw new Error(
          "This account does not have administrator access."
        );
      }

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setError(
        error?.message ||
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      <div className="hidden w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <Trophy size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              SportsHub
            </h1>

            <p className="text-sm text-blue-200">
              Administration
            </p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200">
            Management Portal
          </p>

          <h2 className="max-w-lg text-5xl font-bold leading-tight">
            Manage your sports community.
          </h2>

          <p className="mt-6 max-w-lg text-lg text-blue-100">
            Manage facilities, members, bookings,
            sports and community activities from one
            central dashboard.
          </p>
        </div>

        <p className="text-sm text-blue-200">
          Community Sports Facilities Booking System
        </p>

      </div>

      <div className="flex flex-1 items-center justify-center p-6">

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Sign In
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in to access the administration panel.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="admin@example.com"
                />

              </div>
            </div>

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}