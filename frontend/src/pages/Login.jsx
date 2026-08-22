import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Trophy } from "lucide-react";

import { login } from "../services/api";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // Call the login function from api.js
            await login({
                email,
                password,
            });

            // Login successful
            navigate("/dashboard");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* LEFT PANEL */}
            <div className="hidden w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">

                {/* Logo */}
                <div>
                    <div className="flex items-center gap-3">
                        <Trophy size={32} />

                        <span className="text-2xl font-bold">
                            SportsHub
                        </span>
                    </div>
                </div>

                {/* Hero Text */}
                <div>
                    <h2 className="max-w-lg text-5xl font-bold leading-tight">
                        Find your game.
                        <br />
                        Book your place.
                    </h2>

                    <p className="mt-6 max-w-md text-lg text-blue-100">
                        Discover community sports facilities and
                        manage your bookings in one simple place.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-sm text-blue-200">
                    Community Sports Facilities Booking System
                </p>
            </div>

            {/* LOGIN SECTION */}
            <div className="flex flex-1 items-center justify-center p-6">

                <div className="w-full max-w-md">

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Sign in to continue to SportsHub.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* EMAIL */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <div className="relative">

                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {/* Show / Hide Password */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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

                        {/* SIGN IN BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Create one
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}