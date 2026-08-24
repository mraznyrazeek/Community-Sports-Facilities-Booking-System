import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  Trash2,
  Pencil,
  Search,
  X,
  ShieldCheck,
  UserCheck,
  UserX,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react";

import {
  getMembers,
  updateMember,
  deleteMember,
  type Member,
} from "../services/api";

import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Members() {
  const [members, setMembers] =
    useState<Member[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [roleFilter, setRoleFilter] =
    useState("All");

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState<Member | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [role, setRole] =
    useState("Member");

  const [status, setStatus] =
    useState("Active");

  const [saving, setSaving] =
    useState(false);

  /* =========================================================
     LOAD MEMBERS
     ========================================================= */

  const loadMembers = async () => {
    try {
      setLoading(true);

      const data =
        await getMembers();

      setMembers(data || []);
    } catch (error) {
      console.error(
        "Failed to load members:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalMembers =
    members.length;

  const activeMembers =
    members.filter(
      (member) =>
        member.status
          ?.toLowerCase() ===
        "active"
    ).length;

  const inactiveMembers =
    members.filter(
      (member) =>
        member.status
          ?.toLowerCase() ===
        "inactive"
    ).length;

  const adminMembers =
    members.filter(
      (member) =>
        member.role
          ?.toLowerCase() ===
        "admin"
    ).length;

  /* =========================================================
     FILTER MEMBERS
     ========================================================= */

  const filteredMembers =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return members.filter(
        (member) => {
          const matchesSearch =
            !searchValue ||
            member.name
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            member.email
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            member.phone
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            String(
              member.memberId
            ).includes(
              searchValue
            );

          const matchesStatus =
            statusFilter ===
              "All" ||
            member.status
              ?.toLowerCase() ===
              statusFilter.toLowerCase();

          const matchesRole =
            roleFilter ===
              "All" ||
            member.role
              ?.toLowerCase() ===
              roleFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesRole
          );
        }
      );
    }, [
      members,
      search,
      statusFilter,
      roleFilter,
    ]);

  /* =========================================================
     OPEN EDIT MODAL
     ========================================================= */

  const openEditModal = (
    member: Member
  ) => {
    setEditingMember(member);

    setName(
      member.name || ""
    );

    setEmail(
      member.email || ""
    );

    setPhone(
      member.phone || ""
    );

    setRole(
      member.role || "Member"
    );

    setStatus(
      member.status || "Active"
    );

    setShowEditModal(true);
  };

  /* =========================================================
     CLOSE EDIT MODAL
     ========================================================= */

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);

    setEditingMember(null);

    setName("");
    setEmail("");
    setPhone("");
    setRole("Member");
    setStatus("Active");
  };

  /* =========================================================
     UPDATE MEMBER
     ========================================================= */

  const handleUpdate = async (
  event: React.FormEvent
) => {
  event.preventDefault();

  if (!editingMember) {
    return;
  }

  try {
    setSaving(true);

    await updateMember(
      editingMember.memberId,
      {
        memberId: editingMember.memberId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        status: status,
        userRole: role,
      }
    );

    // IMPORTANT:
    // Reload the data from the backend after updating.
    // This confirms that the database was actually updated.
    await loadMembers();

    closeEditModal();

  } catch (error: any) {
    console.error("Update member error:", error);

    alert(
      error?.message ||
      "Unable to update member."
    );
  } finally {
    setSaving(false);
  }
};

  /* =========================================================
     DELETE MEMBER
     ========================================================= */

  const removeMember = async (
    id: number
  ) => {
    const member =
      members.find(
        (item) =>
          item.memberId === id
      );

    if (!member) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${member.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMember(id);

      setMembers(
        (currentMembers) =>
          currentMembers.filter(
            (item) =>
              item.memberId !== id
          )
      );

    } catch (error: any) {
      console.error(
        "Failed to delete member:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete member."
      );
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <LoadingSpinner
        text="Loading members..."
      />
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="space-y-7">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
          <Users size={16} />

          Management
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Members
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage registered community
          members, roles, and account
          status.
        </p>
      </div>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Members
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalMembers}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Registered accounts
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={21} />
            </div>

          </div>
        </div>

        {/* Active */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {activeMembers}
              </p>

              <p className="mt-1 text-xs text-emerald-500">
                Currently active
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserCheck size={21} />
            </div>

          </div>
        </div>

        {/* Inactive */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {inactiveMembers}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Inactive accounts
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
              <UserX size={21} />
            </div>

          </div>
        </div>

        {/* Admins */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Administrators
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {adminMembers}
              </p>

              <p className="mt-1 text-xs text-blue-500">
                Admin accounts
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck size={21} />
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          SEARCH + FILTERS
          ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search members..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          {/* Role */}

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Roles
            </option>

            <option value="Admin">
              Admin
            </option>

            <option value="Member">
              Member
            </option>
          </select>

        </div>

      </div>

      {/* =====================================================
          MEMBERS TABLE
          ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

          <div>
            <h2 className="font-semibold text-slate-900">
              Member Directory
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Showing{" "}
              {
                filteredMembers.length
              }{" "}
              of{" "}
              {members.length}{" "}
              members
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Member
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Contact
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Joined
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredMembers.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <UserRound size={22} />
                    </div>

                    <p className="mt-4 font-semibold text-slate-700">
                      No members found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your
                      search or filters.
                    </p>

                  </td>
                </tr>

              ) : (

                filteredMembers.map(
                  (member) => {

                    const isActive =
                      member.status
                        ?.toLowerCase() ===
                      "active";

                    const isAdmin =
                      member.role
                        ?.toLowerCase() ===
                      "admin";

                    return (
                      <tr
                        key={
                          member.memberId
                        }
                        className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                      >

                        {/* Member */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                              {member.name
                                ?.charAt(
                                  0
                                )
                                .toUpperCase() ||
                                "M"}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-slate-900">
                                {member.name ||
                                  "Unknown Member"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Member #
                                {
                                  member.memberId
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Contact */}

                        <td className="px-6 py-5">

                          <div className="space-y-1.5">

                            <div className="flex items-center gap-2 text-sm text-slate-600">

                              <Mail
                                size={14}
                                className="text-slate-400"
                              />

                              <span>
                                {
                                  member.email ||
                                  "—"
                                }
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400">

                              <Phone
                                size={13}
                              />

                              <span>
                                {
                                  member.phone ||
                                  "No phone"
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* Role */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              isAdmin
                                ? "bg-purple-50 text-purple-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >

                            {isAdmin ? (
                              <ShieldCheck
                                size={13}
                              />
                            ) : (
                              <UserRound
                                size={13}
                              />
                            )}

                            {
                              member.role ||
                              "Member"
                            }

                          </span>

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {
                              member.status ||
                              "Unknown"
                            }

                          </span>

                        </td>

                        {/* Joined */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-500">

                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            {member.createdAt
                              ? new Date(
                                  member.createdAt
                                ).toLocaleDateString(
                                  "en-GB"
                                )
                              : "—"}

                          </div>

                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  member
                                )
                              }
                              title="Edit member"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeMember(
                                  member.memberId
                                )
                              }
                              title="Delete member"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          EDIT MODAL
          ===================================================== */}

      {showEditModal &&
        editingMember && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Edit Member
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Update member account
                    information.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={19} />
                </button>

              </div>

              {/* Form */}

              <form
                onSubmit={
                  handleUpdate
                }
                className="space-y-5 p-6"
              >

                {/* Name */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(
                      event
                    ) =>
                      setName(
                        event.target
                          .value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* Email */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* Phone */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(
                      event
                    ) =>
                      setPhone(
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* Role + Status */}

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Role */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Role
                    </label>

                    <select
                      value={role}
                      onChange={(
                        event
                      ) =>
                        setRole(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >

                      <option value="Member">
                        Member
                      </option>

                      <option value="Admin">
                        Admin
                      </option>

                    </select>

                  </div>

                  {/* Status */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(
                        event
                      ) =>
                        setStatus(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >

                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>

                    </select>

                  </div>

                </div>

                {/* Buttons */}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                  <button
                    type="button"
                    onClick={
                      closeEditModal
                    }
                    disabled={
                      saving
                    }
                    className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}