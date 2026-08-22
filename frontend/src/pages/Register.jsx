import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, User, Lock, Eye, EyeOff, Trophy } from "lucide-react";

import { apiRequest } from "../services/api";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await apiRequest("/Auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                }),
            });

            navigate("/login", {
                state: {
                    message:
                        "Registration successful. Please sign in.",
                },
            });
        } catch (err) {
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Branding */}
            <div className="hidden w-1/2 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3">
                    <Trophy size={32} />

                    <span className="text-2xl font-bold">
                        SportsHub
                    </span>
                </div>

                <div>
                    <h2 className="text-5xl font-bold leading-tight">
                        Get in the game.
                    </h2>

                    <p className="mt-5 max-w-md text-lg text-blue-100">
                        Create your account and start discovering
                        local sports facilities.
                    </p>
                </div>

                <p className="text-sm text-blue-200">
                    Community Sports Facilities Booking System
                </p>
            </div>

            {/* Form */}
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="mb-7">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Create your account
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Join SportsHub today.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>

                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Phone
                            </label>

                            <div className="relative">
                                <Phone
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-12 outline-none focus:border-blue-500"
                                    placeholder="Create a password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-200 py-3 px-4 outline-none focus:border-blue-500"
                                placeholder="Confirm password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-blue-600"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}