import { FormEvent, useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    Trophy,
    User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/api";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const hasMinimumLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);

    const passwordValid =
        hasMinimumLength &&
        hasUppercase;

    const passwordsMatch =
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword;

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!phone.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        if (!passwordValid) {
            setError(
                "Password must contain at least 8 characters and one uppercase letter."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await register({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    registered: true,
                    email: email.trim(),
                },
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create your account."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="relative min-h-screen overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />

                <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

                <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl" />

                <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">

                    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30 lg:grid-cols-2">


                        <div className="relative hidden overflow-hidden bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">

                            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-950" />

                            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

                            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />


                            <div className="relative">

                                {/* Brand */}

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

                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-blue-100 backdrop-blur">

                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                        Join your community

                                    </div>


                                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">

                                        Your next game

                                        <span className="mt-1 block text-blue-200">
                                            starts here.
                                        </span>

                                    </h1>


                                    <p className="mt-5 text-sm leading-6 text-blue-100/75">
                                        Create your member account and
                                        discover sports, facilities and
                                        activities in your community.
                                    </p>

                                </div>

                            </div>


                            <div className="relative flex items-center gap-3 text-xs text-blue-100/70">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                                    <Trophy size={15} />
                                </div>

                                <span>
                                    One account. Your entire sports community.
                                </span>

                            </div>

                        </div>


                        <div className="p-6 sm:p-10 lg:p-12">

                            {/* Mobile brand */}

                            <div className="mb-7 flex items-center gap-3 lg:hidden">

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

                                {/* Heading */}

                                <p className="text-sm font-semibold text-blue-600">
                                    New member
                                </p>

                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                    Create your account
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Join the community and start discovering
                                    your next game.
                                </p>


                                {/* Error */}

                                {error && (
                                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                        {error}
                                    </div>
                                )}


                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-7 space-y-4"
                                >

                                    {/* NAME */}

                                    <div>

                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Full name
                                        </label>

                                        <div className="relative">

                                            <User
                                                size={18}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="name"
                                                type="text"
                                                autoComplete="name"
                                                value={name}
                                                onChange={(event) =>
                                                    setName(event.target.value)
                                                }
                                                placeholder="Your full name"
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            />

                                        </div>

                                    </div>


                                    {/* EMAIL */}

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
                                                onChange={(event) =>
                                                    setEmail(event.target.value)
                                                }
                                                placeholder="you@example.com"
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            />

                                        </div>

                                    </div>


                                    {/* PHONE */}

                                    <div>

                                        <label
                                            htmlFor="phone"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Phone number
                                        </label>

                                        <div className="relative">

                                            <Phone
                                                size={18}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                value={phone}
                                                onChange={(event) =>
                                                    setPhone(event.target.value)
                                                }
                                                placeholder="+94 7X XXX XXXX"
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            />

                                        </div>

                                    </div>

                                    <div>

                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Password
                                        </label>

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
                                                autoComplete="new-password"
                                                value={password}
                                                onChange={(event) =>
                                                    setPassword(event.target.value)
                                                }
                                                placeholder="Create a password"
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
                                                        (value) => !value
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


                                        {/* LIVE PASSWORD VALIDATION */}

                                        {password.length > 0 && (
                                            <div className="mt-2 space-y-1">

                                                {password.length < 8 && (
                                                    <p className="flex items-center gap-2 text-xs font-medium text-red-600">

                                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold">
                                                            !
                                                        </span>

                                                        At least 8 characters

                                                    </p>
                                                )}


                                                {!/[A-Z]/.test(password) && (
                                                    <p className="flex items-center gap-2 text-xs font-medium text-red-600">

                                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold">
                                                            !
                                                        </span>

                                                        One uppercase letter

                                                    </p>
                                                )}


                                                {passwordValid && (
                                                    <p className="flex items-center gap-2 text-xs font-medium text-emerald-600">

                                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold">
                                                            ✓
                                                        </span>

                                                        Password looks good

                                                    </p>
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    <div>

                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Confirm password
                                        </label>

                                        <div className="relative">

                                            <LockKeyhole
                                                size={18}
                                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="new-password"
                                                value={confirmPassword}
                                                onChange={(event) =>
                                                    setConfirmPassword(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Re-enter your password"
                                                className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                                                    confirmPassword &&
                                                    !passwordsMatch
                                                        ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
                                                        : confirmPassword &&
                                                          passwordsMatch
                                                        ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/10"
                                                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (value) => !value
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>

                                        </div>


                                        {/* Confirm password validation */}

                                        {confirmPassword &&
                                            !passwordsMatch && (
                                                <p className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">

                                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold">
                                                        !
                                                    </span>

                                                    Passwords do not match.

                                                </p>
                                            )}

                                        {passwordsMatch && (
                                            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600">

                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold">
                                                    ✓
                                                </span>

                                                Passwords match.

                                            </p>
                                        )}

                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            !passwordValid ||
                                            !passwordsMatch
                                        }
                                        className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-md hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create account

                                                <ArrowRight
                                                    size={16}
                                                    className="transition-transform group-hover:translate-x-0.5"
                                                />
                                            </>
                                        )}

                                    </button>

                                </form>


                                {/* LOGIN LINK */}

                                <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                                    <p className="text-sm text-slate-500">

                                        Already have an account?{" "}

                                        <Link
                                            to="/login"
                                            className="font-semibold text-blue-600 transition hover:text-blue-700"
                                        >
                                            Sign in
                                        </Link>

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}