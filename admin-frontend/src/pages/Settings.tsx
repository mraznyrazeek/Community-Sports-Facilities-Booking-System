import { useEffect, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";

import {
  getAdminMember,
  getAdminMembers,
  changePassword,
  changeAdminPassword,
  deleteAdmin,
} from "../services/api";


interface AdminMember {
  memberId: number;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
  role?: string | null;
  createdAt?: string;
}

interface PasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}

function PasswordField({
  label,
  value,
  placeholder,
  show,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="
            w-full rounded-xl
            border border-slate-200
            bg-white
            px-4 py-3 pr-12
            text-sm text-slate-900
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-50
          "
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="
            absolute right-2 top-1/2
            flex h-9 w-9
            -translate-y-1/2
            items-center justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status?: string;
}) {
  const value = status || "Active";

  const normalized = value.toLowerCase();

  const isActive =
    normalized === "active" ||
    normalized === "confirmed" ||
    normalized === "completed";

  const isInactive =
    normalized === "inactive" ||
    normalized === "disabled";

  if (isInactive) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {value}
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {value}
    </span>
  );
}


export default function Settings() {
  const admin = getAdminMember();

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [admins, setAdmins] =
    useState<AdminMember[]>([]);

  const [loadingAdmins, setLoadingAdmins] =
    useState(true);

  const [adminError, setAdminError] =
    useState("");

  const [selectedAdmin, setSelectedAdmin] =
    useState<AdminMember | null>(null);

  const [showAdminDetails, setShowAdminDetails] =
    useState(false);

  const [showResetPassword, setShowResetPassword] =
    useState(false);

  const [adminNewPassword, setAdminNewPassword] =
    useState("");

  const [adminConfirmPassword, setAdminConfirmPassword] =
    useState("");

  const [showAdminNewPassword, setShowAdminNewPassword] =
    useState(false);

  const [showAdminConfirmPassword, setShowAdminConfirmPassword] =
    useState(false);

  const [resettingPassword, setResettingPassword] =
    useState(false);

  const [resetMessage, setResetMessage] =
    useState("");

  const [resetError, setResetError] =
    useState("");

  const [deletingAdminId, setDeletingAdminId] =
    useState<number | null>(null);

  const [deleteError, setDeleteError] =
    useState("");

  async function loadAdmins() {
    try {
      setLoadingAdmins(true);
      setAdminError("");

      const data = await getAdminMembers();

      setAdmins(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Administrator list loading error:",
        error
      );

      setAdminError(
        "Unable to load administrator accounts."
      );
    } finally {
      setLoadingAdmins(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleChangePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      await changePassword(
        currentPassword,
        newPassword
      );

      setPasswordMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordError(
        "Unable to change password. Please check your current password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  function openAdminDetails(
    adminMember: AdminMember
  ) {
    setSelectedAdmin(adminMember);

    setShowAdminDetails(true);

    setShowResetPassword(false);

    setAdminNewPassword("");
    setAdminConfirmPassword("");

    setResetMessage("");
    setResetError("");
    setDeleteError("");

    setShowAdminNewPassword(false);
    setShowAdminConfirmPassword(false);
  }

  function closeAdminDetails() {
    setShowAdminDetails(false);

    setSelectedAdmin(null);

    setShowResetPassword(false);

    setAdminNewPassword("");
    setAdminConfirmPassword("");

    setResetMessage("");
    setResetError("");

    setShowAdminNewPassword(false);
    setShowAdminConfirmPassword(false);
  }

  async function handleAdminPasswordChange(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setResetMessage("");
    setResetError("");

    if (!selectedAdmin) {
      return;
    }

    if (adminNewPassword.length < 8) {
      setResetError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      adminNewPassword !==
      adminConfirmPassword
    ) {
      setResetError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setResettingPassword(true);


      await changeAdminPassword(
        selectedAdmin.memberId,
        adminNewPassword
      );
      setResetMessage(
        "Administrator password updated successfully."
      );

      setAdminNewPassword("");
      setAdminConfirmPassword("");

      setShowAdminNewPassword(false);
      setShowAdminConfirmPassword(false);
    } catch (error) {
      console.error(
        "Administrator password reset error:",
        error
      );

      setResetError(
        "Unable to update administrator password."
      );
    } finally {
      setResettingPassword(false);
    }
  }

  // ==========================================================
  // DELETE ADMIN
  // ==========================================================

  async function handleDeleteAdmin(
    adminMember: AdminMember
  ) {
    setDeleteError("");

    if (
      admin?.memberId &&
      Number(admin.memberId) ===
      Number(adminMember.memberId)
    ) {
      setDeleteError(
        "You cannot delete the administrator account currently signed in."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the administrator account for ${adminMember.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAdminId(
        adminMember.memberId
      );

      await deleteAdmin(
        adminMember.memberId
      );

      setAdmins((current) =>
        current.filter(
          (item) =>
            Number(item.memberId) !==
            Number(adminMember.memberId)
        )
      );

      if (
        selectedAdmin &&
        Number(selectedAdmin.memberId) ===
        Number(adminMember.memberId)
      ) {
        closeAdminDetails();
      }
    } catch (error) {
      console.error(
        "Administrator deletion error:",
        error
      );

      setDeleteError(
        "Unable to delete this administrator account."
      );
    } finally {
      setDeletingAdminId(null);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      <div>
        <p className="text-sm font-semibold text-blue-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your administrator account, security settings and authorized administrator access.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Current Administrator
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Account currently signed in to this
                administration panel.
              </p>
            </div>

          </div>

        </div>


        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Name */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Name
            </p>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {admin?.name || "Unknown"}
            </p>

          </div>


          {/* Email */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email
            </p>

            <p className="mt-2 break-all text-sm font-bold text-slate-900">
              {admin?.email || "Unknown"}
            </p>

          </div>


          {/* Role */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role
            </p>

            <div className="mt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                <ShieldCheck size={14} />
                {admin?.role || "Admin"}
              </span>
            </div>

          </div>


          {/* Status */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status
            </p>

            <div className="mt-2">
              <StatusBadge
                status={
                  admin?.status ||
                  "Active"
                }
              />
            </div>

          </div>

        </div>

      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Lock size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Account Security
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Change the password for your own
                administrator account.
              </p>
            </div>

          </div>

        </div>


        <div className="p-6">

          {!showPasswordForm ? (

            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordMessage("");
                setPasswordError("");
              }}
              className="
                inline-flex items-center gap-2
                rounded-xl
                bg-blue-600
                px-5 py-3
                text-sm font-semibold text-white
                transition
                hover:bg-blue-700
                focus:outline-none
                focus:ring-4
                focus:ring-blue-100
              "
            >
              <KeyRound size={17} />

              Change Password
            </button>

          ) : (

            <form
              onSubmit={handleChangePassword}
              className="max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >

              <div className="mb-6">

                <h3 className="text-lg font-bold text-slate-950">
                  Update Password
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your current password and
                  choose a new secure password.
                </p>

              </div>


              <div className="space-y-5">

                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  placeholder="Enter current password"
                  show={showCurrentPassword}
                  onChange={setCurrentPassword}
                  onToggle={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                />


                <div>

                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    placeholder="Enter new password"
                    show={showNewPassword}
                    onChange={setNewPassword}
                    onToggle={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Password must contain at least
                    8 characters.
                  </p>

                </div>


                <PasswordField
                  label="Confirm New Password"
                  value={confirmPassword}
                  placeholder="Confirm new password"
                  show={showConfirmPassword}
                  onChange={setConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                />

                {passwordError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {passwordError}
                    </span>
                  </div>
                )}

                {passwordMessage && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {passwordMessage}
                    </span>
                  </div>
                )}


                <div className="flex flex-wrap gap-3 pt-1">

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      bg-blue-600
                      px-5 py-3
                      text-sm font-semibold text-white
                      transition
                      hover:bg-blue-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {changingPassword && (
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                    )}

                    {changingPassword
                      ? "Updating..."
                      : "Update Password"}

                  </button>


                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);

                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");

                      setPasswordError("");
                      setPasswordMessage("");

                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-5 py-3
                      text-sm font-semibold
                      text-slate-700
                      transition
                      hover:bg-slate-50
                    "
                  >
                    <X size={16} />

                    Cancel
                  </button>

                </div>

              </div>

            </form>

          )}

        </div>

      </section>


      {/* ======================================================
          ADMINISTRATOR ACCOUNTS
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserPlus size={22} />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-950">
                  Administrator Accounts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage administrators with
                  authorized access.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={loadAdmins}
              disabled={loadingAdmins}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-4 py-2.5
                text-sm font-semibold
                text-slate-700
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <RefreshCw
                size={16}
                className={
                  loadingAdmins
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </div>


        <div className="p-6">

          {adminError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{adminError}</span>
            </div>
          )}


          {deleteError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{deleteError}</span>
            </div>
          )}


          {loadingAdmins ? (

            <div className="flex items-center justify-center py-14 text-sm text-slate-500">

              <RefreshCw
                size={18}
                className="mr-2 animate-spin"
              />

              Loading administrator accounts...

            </div>

          ) : admins.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">

              <Shield
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold text-slate-700">
                No administrator accounts found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                There are currently no administrator
                accounts to display.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[760px]">

                <thead>

                  <tr className="border-b border-slate-100 text-left">

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Administrator
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Role
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {admins.map(
                    (adminMember) => {

                      const isCurrentAdmin =
                        admin?.memberId &&
                        Number(admin.memberId) ===
                        Number(
                          adminMember.memberId
                        );

                      return (
                        <tr
                          key={
                            adminMember.memberId
                          }
                          className="
                            border-b
                            border-slate-50
                            last:border-0
                            transition
                            hover:bg-slate-50/70
                          "
                        >

                          {/* Administrator */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">

                                {adminMember.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "A"}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate font-semibold text-slate-900">

                                  {adminMember.name}

                                  {isCurrentAdmin && (
                                    <span className="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                                      You
                                    </span>
                                  )}

                                </p>

                              </div>

                            </div>

                          </td>


                          {/* Email */}

                          <td className="px-4 py-4">

                            <span className="text-sm text-slate-600">
                              {adminMember.email}
                            </span>

                          </td>


                          {/* Role */}

                          <td className="px-4 py-4">

                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                              {adminMember.role ||
                                "Admin"}
                            </span>

                          </td>


                          {/* Status */}

                          <td className="px-4 py-4">

                            <StatusBadge
                              status={
                                adminMember.status ||
                                "Active"
                              }
                            />

                          </td>


                          {/* Actions */}

                          <td className="px-4 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openAdminDetails(
                                    adminMember
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  text-slate-700
                                  transition
                                  hover:bg-slate-50
                                "
                              >

                                <User size={14} />

                                View

                              </button>


                              {!isCurrentAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteAdmin(
                                      adminMember
                                    )
                                  }
                                  disabled={
                                    deletingAdminId ===
                                    adminMember.memberId
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-red-100
                                    bg-red-50
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-red-600
                                    transition
                                    hover:bg-red-100
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >

                                  {deletingAdminId ===
                                    adminMember.memberId ? (
                                    <RefreshCw
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={14}
                                    />
                                  )}

                                  Delete

                                </button>
                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          SECURITY NOTICE
      ====================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <Shield size={20} />
          </div>

          <div>

            <h3 className="font-semibold text-blue-950">
              Administrator Security
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-700">
              Administrator passwords are securely
              stored and cannot be viewed. Administrators
              can change their own password, while
              authorized administrators can reset another
              administrator's password.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          ADMIN DETAILS MODAL
      ====================================================== */}

      {showAdminDetails &&
        selectedAdmin && (

          <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/40
            p-4
            backdrop-blur-sm
          ">

            <div className="
              w-full
              max-w-2xl
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
            ">

              {/* Modal Header */}

              <div className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-6
                py-5
              ">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <User size={21} />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-slate-950">
                      Administrator Details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      View account information and
                      security actions.
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={closeAdminDetails}
                  className="
                    rounded-xl
                    p-2
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                  "
                >
                  <X size={20} />
                </button>

              </div>


              {/* Modal Body */}

              <div className="max-h-[75vh] overflow-y-auto p-6">

                {/* Account information */}

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <User size={16} />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Name
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-slate-900">
                      {selectedAdmin.name}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <Mail size={16} />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Email
                      </span>

                    </div>

                    <p className="mt-2 break-all font-semibold text-slate-900">
                      {selectedAdmin.email}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <Phone size={16} />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Phone
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-slate-900">
                      {selectedAdmin.phone ||
                        "Not provided"}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <ShieldCheck size={16} />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Role
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-slate-900">
                      {selectedAdmin.role ||
                        "Administrator"}
                    </p>

                  </div>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <CheckCircle2 size={16} />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Status
                      </span>

                    </div>

                    <div className="mt-2">
                      <StatusBadge
                        status={
                          selectedAdmin.status ||
                          "Active"
                        }
                      />
                    </div>

                  </div>


                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex items-center gap-2 text-slate-400">

                      <CalendarDays size={16} />

                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Created
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-slate-900">

                      {selectedAdmin.createdAt
                        ? new Date(
                          selectedAdmin.createdAt
                        ).toLocaleDateString()
                        : "Not available"}

                    </p>

                  </div>

                </div>


                {/* Password Security */}

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">

                  <div className="flex items-start gap-3">

                    <Lock
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>

                      <h3 className="font-semibold text-amber-900">
                        Password Security
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        The existing password cannot be
                        viewed. You can securely reset it
                        instead.
                      </p>

                    </div>

                  </div>

                </div>


                {/* Own account */}

                {admin?.memberId &&
                  Number(admin.memberId) ===
                  Number(
                    selectedAdmin.memberId
                  ) ? (

                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-700">

                    This is your currently signed-in
                    administrator account. Use the Account
                    Security section to change your own
                    password.

                  </div>

                ) : (

                  <div className="mt-6">

                    {!showResetPassword ? (

                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPassword(
                            true
                          );

                          setResetMessage("");
                          setResetError("");
                        }}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-blue-700
                          focus:outline-none
                          focus:ring-4
                          focus:ring-blue-100
                        "
                      >

                        <KeyRound size={17} />

                        Reset Administrator Password

                      </button>

                    ) : (

                      <form
                        onSubmit={
                          handleAdminPasswordChange
                        }
                        className="
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50
                          p-5
                        "
                      >

                        <div className="mb-5">

                          <h3 className="font-bold text-slate-900">
                            Reset Password
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">

                            Set a new password for{" "}

                            <span className="font-semibold text-slate-700">
                              {selectedAdmin.name}
                            </span>.

                          </p>

                        </div>


                        <div className="space-y-5">

                          <PasswordField
                            label="New Password"
                            value={
                              adminNewPassword
                            }
                            placeholder="Enter new password"
                            show={
                              showAdminNewPassword
                            }
                            onChange={
                              setAdminNewPassword
                            }
                            onToggle={() =>
                              setShowAdminNewPassword(
                                !showAdminNewPassword
                              )
                            }
                          />


                          <PasswordField
                            label="Confirm New Password"
                            value={
                              adminConfirmPassword
                            }
                            placeholder="Confirm new password"
                            show={
                              showAdminConfirmPassword
                            }
                            onChange={
                              setAdminConfirmPassword
                            }
                            onToggle={() =>
                              setShowAdminConfirmPassword(
                                !showAdminConfirmPassword
                              )
                            }
                          />


                          {resetError && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                              <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                              />

                              <span>
                                {resetError}
                              </span>

                            </div>
                          )}


                          {resetMessage && (
                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

                              <CheckCircle2
                                size={18}
                                className="mt-0.5 shrink-0"
                              />

                              <span>
                                {resetMessage}
                              </span>

                            </div>
                          )}


                          <div className="flex flex-wrap gap-3">

                            <button
                              type="submit"
                              disabled={
                                resettingPassword
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-blue-600
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                              "
                            >

                              {resettingPassword && (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              )}

                              {resettingPassword
                                ? "Updating..."
                                : "Update Password"}

                            </button>


                            <button
                              type="button"
                              onClick={() => {
                                setShowResetPassword(
                                  false
                                );

                                setAdminNewPassword(
                                  ""
                                );

                                setAdminConfirmPassword(
                                  ""
                                );

                                setResetError("");
                                setResetMessage("");

                                setShowAdminNewPassword(
                                  false
                                );

                                setShowAdminConfirmPassword(
                                  false
                                );
                              }}
                              className="
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-slate-700
                                transition
                                hover:bg-slate-50
                              "
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      </form>

                    )}

                  </div>

                )}

              </div>

            </div>

          </div>
        )}

    </div>
  );
}