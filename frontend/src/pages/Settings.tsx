import { FormEvent, useState } from "react";
import {
    AlertTriangle,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    Phone,
    Save,
    Shield,
    Trash2,
    User,
    X,
} from "lucide-react";

import {
    changeMyPassword,
    deactivateMyAccount,
    getCurrentMember,
    updateMyProfile,
} from "../services/api";

type Member = {
    memberId: number;
    name: string;
    email: string;
    phone?: string | null;
    status?: string;
};

type SettingsSection = "profile" | "password";

export default function Settings() {
    const member = getCurrentMember() as Member | null;

    // ============================================================
    // SECTION
    // ============================================================

    const [activeSection, setActiveSection] =
        useState<SettingsSection>("profile");

    // ============================================================
    // PROFILE
    // ============================================================

    const [name, setName] = useState(
        member?.name || ""
    );

    const [email, setEmail] = useState(
        member?.email || ""
    );

    const [phone, setPhone] = useState(
        member?.phone || ""
    );

    const [profileSuccess, setProfileSuccess] =
        useState("");

    const [profileError, setProfileError] =
        useState("");

    const [savingProfile, setSavingProfile] =
        useState(false);

    // ============================================================
    // PASSWORD
    // ============================================================

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [passwordSuccess, setPasswordSuccess] =
        useState("");

    const [passwordError, setPasswordError] =
        useState("");

    // ============================================================
    // DEACTIVATE
    // ============================================================

    const [showDeactivateModal, setShowDeactivateModal] =
        useState(false);

    const [deactivating, setDeactivating] =
        useState(false);

    const [deactivateError, setDeactivateError] =
        useState("");

    // ============================================================
    // PASSWORD VALIDATION
    // ============================================================

    const hasMinimumLength =
        newPassword.length >= 8;

    const hasUppercase =
        /[A-Z]/.test(newPassword);

    const passwordValid =
        hasMinimumLength &&
        hasUppercase;

    const passwordsMatch =
        newPassword.length > 0 &&
        confirmPassword.length > 0 &&
        newPassword === confirmPassword;

    // ============================================================
    // PROFILE SAVE
    // ============================================================

    const handleProfileSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setProfileSuccess("");
        setProfileError("");

        if (!name.trim()) {
            setProfileError(
                "Please enter your full name."
            );
            return;
        }

        if (!email.trim()) {
            setProfileError(
                "Please enter your email address."
            );
            return;
        }

        try {
            setSavingProfile(true);

            const data = await updateMyProfile({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
            });

            // Update local member information so
            // CustomerNavbar changes immediately.
            if (data?.member) {
                localStorage.setItem(
                    "member",
                    JSON.stringify(data.member)
                );
            }

            setProfileSuccess(
                "Your profile has been updated successfully."
            );
        } catch (error) {
            setProfileError(
                error instanceof Error
                    ? error.message
                    : "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    // ============================================================
    // PASSWORD
    // ============================================================

    const handlePasswordSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setPasswordSuccess("");
        setPasswordError("");

        if (!currentPassword) {
            setPasswordError(
                "Please enter your current password."
            );
            return;
        }

        if (!passwordValid) {
            setPasswordError(
                "Password must contain at least 8 characters and one uppercase letter."
            );
            return;
        }

        if (!passwordsMatch) {
            setPasswordError(
                "New passwords do not match."
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "Your new password must be different from your current password."
            );
            return;
        }

        try {
            await changeMyPassword({
                currentPassword,
                newPassword,
            });

            setPasswordSuccess(
                "Password changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            setPasswordError(
                error instanceof Error
                    ? error.message
                    : "Unable to change your password."
            );
        }
    };

    // ============================================================
    // DEACTIVATE ACCOUNT
    // ============================================================

    const handleDeactivateAccount = async () => {
        setDeactivateError("");

        try {
            setDeactivating(true);

            await deactivateMyAccount();

            localStorage.removeItem("token");
            localStorage.removeItem("member");

            window.location.href =
                "/login?deactivated=true";
        } catch (error) {
            setDeactivateError(
                error instanceof Error
                    ? error.message
                    : "Unable to deactivate your account."
            );
        } finally {
            setDeactivating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Settings
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your personal information and account security.
                    </p>

                </div>
            </section>


            {/* =====================================================
                SETTINGS CONTENT
            ===================================================== */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">

                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

                        <button
                            type="button"
                            onClick={() =>
                                setActiveSection("profile")
                            }
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${activeSection === "profile"
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-700 hover:bg-slate-50"
                                }`}
                        >

                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeSection === "profile"
                                    ? "bg-blue-100"
                                    : "bg-slate-100"
                                    }`}
                            >
                                <User size={17} />
                            </span>

                            <span className="text-sm font-semibold">
                                Personal Information
                            </span>

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setActiveSection("password")
                            }
                            className={`mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${activeSection === "password"
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-700 hover:bg-slate-50"
                                }`}
                        >

                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeSection === "password"
                                    ? "bg-blue-100"
                                    : "bg-slate-100"
                                    }`}
                            >
                                <Shield size={17} />
                            </span>

                            <span className="text-sm font-semibold">
                                Password & Security
                            </span>

                        </button>

                    </aside>


                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="space-y-6">

                        {/* =================================================
                            PERSONAL INFORMATION
                        ================================================= */}

                        {activeSection === "profile" && (

                            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-6 sm:px-8">

                                    <div className="flex items-start gap-4">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <User size={20} />
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-slate-950">
                                                Personal Information
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Update your basic member
                                                information.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <form
                                    onSubmit={handleProfileSubmit}
                                    className="p-6 sm:p-8"
                                >

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                        {/* NAME */}

                                        <div className="sm:col-span-2">

                                            <label
                                                htmlFor="settings-name"
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
                                                    id="settings-name"
                                                    value={name}
                                                    onChange={(event) => {
                                                        setName(
                                                            event.target.value
                                                        );
                                                        setProfileSuccess("");
                                                    }}
                                                    placeholder="Your full name"
                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                />

                                            </div>

                                        </div>


                                        {/* EMAIL */}

                                        <div>

                                            <label
                                                htmlFor="settings-email"
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
                                                    id="settings-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) => {
                                                        setEmail(
                                                            event.target.value
                                                        );
                                                        setProfileSuccess("");
                                                    }}
                                                    placeholder="you@example.com"
                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                />

                                            </div>

                                        </div>


                                        {/* PHONE */}

                                        <div>

                                            <label
                                                htmlFor="settings-phone"
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
                                                    id="settings-phone"
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(event) => {
                                                        setPhone(
                                                            event.target.value
                                                        );
                                                        setProfileSuccess("");
                                                    }}
                                                    placeholder="+94 7X XXX XXXX"
                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* SUCCESS */}

                                    {profileSuccess && (

                                        <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                                                ✓
                                            </span>

                                            {profileSuccess}

                                        </div>

                                    )}


                                    {/* ERROR */}

                                    {profileError && (

                                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                            {profileError}
                                        </div>

                                    )}


                                    {/* SAVE */}

                                    <div className="mt-7 flex justify-end">

                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            {savingProfile ? (
                                                <>
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />

                                                    Save Changes
                                                </>
                                            )}

                                        </button>

                                    </div>

                                </form>

                            </section>

                        )}


                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        {activeSection === "password" && (

                            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-6 sm:px-8">

                                    <div className="flex items-start gap-4">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                            <Shield size={20} />
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-slate-950">
                                                Password & Security
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Update your password and keep
                                                your account secure.
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="p-6 sm:p-8"
                                >

                                    <div className="max-w-2xl space-y-5">

                                        {/* CURRENT */}

                                        <PasswordField
                                            id="current-password"
                                            label="Current password"
                                            placeholder="Enter your current password"
                                            value={currentPassword}
                                            visible={showCurrentPassword}
                                            onChange={setCurrentPassword}
                                            onToggle={() =>
                                                setShowCurrentPassword(
                                                    (value) => !value
                                                )
                                            }
                                        />


                                        {/* NEW */}

                                        <div>

                                            <PasswordField
                                                id="new-password"
                                                label="New password"
                                                placeholder="Create a new password"
                                                value={newPassword}
                                                visible={showNewPassword}
                                                onChange={setNewPassword}
                                                onToggle={() =>
                                                    setShowNewPassword(
                                                        (value) => !value
                                                    )
                                                }
                                            />


                                            {/* LIVE VALIDATION */}

                                            {newPassword.length > 0 && (

                                                <div className="mt-2 space-y-1">

                                                    {newPassword.length < 8 && (
                                                        <p className="text-xs font-medium text-red-600">
                                                            ⚠ At least 8
                                                            characters
                                                        </p>
                                                    )}

                                                    {!/[A-Z]/.test(newPassword) && (
                                                        <p className="text-xs font-medium text-red-600">
                                                            ⚠ One uppercase
                                                            letter
                                                        </p>
                                                    )}

                                                    {passwordValid && (
                                                        <p className="text-xs font-medium text-emerald-600">
                                                            ✓ Password looks
                                                            good
                                                        </p>
                                                    )}

                                                </div>

                                            )}

                                        </div>


                                        {/* CONFIRM */}

                                        <div>

                                            <PasswordField
                                                id="confirm-password"
                                                label="Confirm new password"
                                                placeholder="Re-enter your new password"
                                                value={confirmPassword}
                                                visible={showConfirmPassword}
                                                onChange={setConfirmPassword}
                                                onToggle={() =>
                                                    setShowConfirmPassword(
                                                        (value) => !value
                                                    )
                                                }
                                            />

                                            {confirmPassword &&
                                                !passwordsMatch && (
                                                    <p className="mt-2 text-xs font-medium text-red-600">
                                                        ⚠ Passwords do not
                                                        match
                                                    </p>
                                                )}

                                            {passwordsMatch && (
                                                <p className="mt-2 text-xs font-medium text-emerald-600">
                                                    ✓ Passwords match
                                                </p>
                                            )}

                                        </div>

                                    </div>


                                    {/* MESSAGE */}

                                    {passwordError && (

                                        <div className="mt-5 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                            {passwordError}
                                        </div>

                                    )}

                                    {passwordSuccess && (

                                        <div className="mt-5 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                            ✓ {passwordSuccess}
                                        </div>

                                    )}


                                    <div className="mt-7 flex justify-end">

                                        <button
                                            type="submit"
                                            disabled={
                                                !currentPassword ||
                                                !passwordValid ||
                                                !passwordsMatch
                                            }
                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                            <KeyRound size={16} />

                                            Change Password

                                        </button>

                                    </div>

                                </form>

                            </section>

                        )}


                        {/* =================================================
                            DANGER ZONE
                        ================================================= */}

                        <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">

                            <div className="border-b border-red-100 bg-red-50/50 px-6 py-5 sm:px-8">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                        <Trash2 size={20} />
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold text-red-700">
                                            Danger Zone
                                        </h2>

                                        <p className="mt-1 text-sm text-red-600/80">
                                            Actions here affect your account.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                                <div>

                                    <h3 className="font-semibold text-slate-900">
                                        Deactivate Account
                                    </h3>

                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                        Deactivate your account and sign out.
                                        Your existing activity history will
                                        remain preserved.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeactivateModal(true)
                                    }
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >

                                    <Trash2 size={16} />

                                    Deactivate Account

                                </button>

                            </div>

                        </section>

                    </div>

                </div>

            </main>


            {/* =========================================================
                DEACTIVATE MODAL
            ========================================================= */}

            {showDeactivateModal && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                    <AlertTriangle size={21} />
                                </div>

                                <div>

                                    <h2 className="font-bold text-slate-950">
                                        Deactivate Account?
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        This will sign you out.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeactivateModal(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        {/* BODY */}

                        <div className="p-6">

                            <p className="text-sm leading-6 text-slate-600">
                                Your account will be deactivated and you will
                                be signed out. Your existing bookings, sports
                                registrations and reviews will remain preserved.
                            </p>


                            {deactivateError && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {deactivateError}
                                </div>
                            )}


                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeactivateModal(false)
                                    }
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    onClick={handleDeactivateAccount}
                                    disabled={deactivating}
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deactivating
                                        ? "Deactivating..."
                                        : "Deactivate Account"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


/* ================================================================
    PASSWORD FIELD
================================================================ */

function PasswordField({
    id,
    label,
    placeholder,
    value,
    visible,
    onChange,
    onToggle,
}: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    visible: boolean;
    onChange: (value: string) => void;
    onToggle: () => void;
}) {
    return (
        <div>

            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}
            </label>

            <div className="relative">

                <KeyRound
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder={placeholder}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                    type="button"
                    aria-label={
                        visible
                            ? "Hide password"
                            : "Show password"
                    }
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >

                    {visible ? (
                        <EyeOff size={17} />
                    ) : (
                        <Eye size={17} />
                    )}

                </button>

            </div>

        </div>
    );
}