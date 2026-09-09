import { FormEvent, useEffect, useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Trophy,
    X,
} from "lucide-react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    login,
    reactivateAccount,
} from "../services/api";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [showReactivateModal, setShowReactivateModal] =
        useState(false);

    const [reactivating, setReactivating] =
        useState(false);

    const [reactivateError, setReactivateError] =
        useState("");

    useEffect(() => {
        const params = new URLSearchParams(
            location.search
        );

        if (
            params.get("deactivated") === "true"
        ) {
            setSuccess(
                "Your account has been deactivated successfully."
            );
        }
    }, [location.search]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setReactivateError("");

        if (!email.trim()) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        if (!password) {
            setError(
                "Please enter your password."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await login({
                email: email.trim(),
                password,
            });

            if (data?.accountInactive) {
                setShowReactivateModal(true);
                return;
            }

            if (!data?.token) {
                setError(
                    "Unable to sign in. Please try again."
                );
                return;
            }

            navigate("/dashboard", {
                replace: true,
            });
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to sign in. Please check your details.";

            if (
                message.toLowerCase().includes(
                    "account is not active"
                ) ||
                message.toLowerCase().includes(
                    "account is inactive"
                )
            ) {
                setShowReactivateModal(true);
                return;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        setReactivateError("");

        if (!email.trim() || !password) {
            setReactivateError(
                "Please enter your email and password."
            );
            return;
        }

        try {
            setReactivating(true);

            const data = await reactivateAccount({
                email: email.trim(),
                password,
            });

            if (!data?.token) {
                setReactivateError(
                    "Unable to reactivate your account."
                );
                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            if (data?.member) {
                localStorage.setItem(
                    "member",
                    JSON.stringify(data.member)
                );
            }

            setShowReactivateModal(false);
            setReactivateError("");

            navigate("/dashboard", {
                replace: true,
            });
        } catch (err) {
            setReactivateError(
                err instanceof Error
                    ? err.message
                    : "Unable to reactivate your account."
            );
        } finally {
            setReactivating(false);
        }
    };

    const handleCloseReactivate = () => {
        if (reactivating) {
            return;
        }

        setShowReactivateModal(false);
        setReactivateError("");
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="relative min-h-screen overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />

                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

                <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl" />

                <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">

                    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30 lg:grid-cols-2">

                        <div className="relative hidden overflow-hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">

                            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950" />

                            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

                            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

                            <div className="relative">

                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-3"
                                >

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur">
                                        <Trophy
                                            size={22}
                                            strokeWidth={2.2}
                                        />
                                    </div>

                                    <div>

                                        <p className="text-base font-bold text-white">
                                            SportsHub
                                        </p>

                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200">
                                            Community Sports
                                        </p>

                                    </div>

                                </Link>

                                <div className="mt-24 max-w-md">


                                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">

                                        Welcome back.

                                        <span className="mt-1 block text-blue-200">
                                            Let's get you playing.
                                        </span>

                                    </h1>

                                    <p className="mt-5 text-sm leading-6 text-blue-100/75">
                                        Sign in to manage your bookings,
                                        explore sports and stay connected
                                        with your community.
                                    </p>

                                </div>

                            </div>

                            <div className="relative flex items-center gap-3 text-xs text-blue-100/70">

                                <ShieldCheck size={16} />

                                <span>
                                    Secure member access
                                </span>

                            </div>

                        </div>

                        <div className="p-6 sm:p-10 lg:p-12">

                            <div className="mb-8 flex items-center gap-3 lg:hidden">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                    <Trophy
                                        size={20}
                                        strokeWidth={2.2}
                                    />
                                </div>

                                <div>

                                    <p className="text-base font-bold text-slate-950">
                                        SportsHub
                                    </p>

                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Community Sports
                                    </p>

                                </div>

                            </div>

                            <div className="mx-auto max-w-md">

                                <div>

                                    <p className="text-sm font-semibold text-blue-600">
                                        Member access
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                        Sign in to your account
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Welcome back. Enter your details
                                        to continue.
                                    </p>

                                </div>

                                {error && (

                                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {error}
                                    </div>

                                )}

                                {success && (

                                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                        {success}
                                    </div>

                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-8 space-y-5"
                                >

                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email address
                                        </label>

                                        <div className="relative">

                                            <Mail
                                                size={18}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                value={email}
                                                onChange={(event) => {
                                                    setEmail(
                                                        event.target.value
                                                    );
                                                    setError("");
                                                }}
                                                placeholder="you@example.com"
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            />

                                        </div>

                                    </div>

                                    <div>

                                        <div className="mb-2 flex items-center justify-between">

                                            <label
                                                htmlFor="password"
                                                className="block text-sm font-semibold text-slate-700"
                                            >
                                                Password
                                            </label>

                                            <button
                                                type="button"
                                                className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                                                onClick={() =>
                                                    setError(
                                                        "Password reset is not available yet."
                                                    )
                                                }
                                            >
                                                Forgot password?
                                            </button>

                                        </div>

                                        <div className="relative">

                                            <LockKeyhole
                                                size={18}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={(event) => {
                                                    setPassword(
                                                        event.target.value
                                                    );
                                                    setError("");
                                                }}
                                                placeholder="Enter your password"
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            />

                                            <button
                                                type="button"
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                onClick={() =>
                                                    setShowPassword(
                                                        (value) =>
                                                            !value
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                            >

                                                {showPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in

                                                <ArrowRight
                                                    size={16}
                                                    className="transition-transform group-hover:translate-x-0.5"
                                                />
                                            </>
                                        )}

                                    </button>

                                </form>

                                <div className="mt-8 border-t border-slate-100 pt-6 text-center">

                                    <p className="text-sm text-slate-500">

                                        Don't have an account?{" "}

                                        <Link
                                            to="/register"
                                            className="font-semibold text-blue-600 transition hover:text-blue-700"
                                        >
                                            Create an account
                                        </Link>

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {showReactivateModal && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <ShieldCheck size={21} />
                                </div>

                                <h2 className="text-xl font-bold text-slate-950">
                                    Reactivate your account?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Your SportsHub account is currently
                                    inactive. Would you like to reactivate
                                    it and continue using your account?
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleCloseReactivate}
                                disabled={reactivating}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <div className="p-6">

                            <div className="rounded-2xl bg-slate-50 p-4">

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Account
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {email}
                                </p>

                            </div>


                            {reactivateError && (

                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {reactivateError}
                                </div>

                            )}


                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    onClick={handleCloseReactivate}
                                    disabled={reactivating}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleReactivate
                                    }
                                    disabled={reactivating}
                                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {reactivating
                                        ? "Reactivating..."
                                        : "Reactivate Account"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}