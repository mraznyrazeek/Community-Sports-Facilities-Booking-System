import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Users,
  Trophy,
  CalendarDays,
  UserRound,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import {
  getMembers,
  getMemberSports,
  deleteMemberSport,
  type Member,
  type MemberSport,
} from "../services/api";

import LoadingSpinner from "../components/common/LoadingSpinner";

export default function MemberSports() {
  const [members, setMembers] = useState<Member[]>([]);

  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  const [memberSports, setMemberSports] =
    useState<MemberSport[]>([]);

  const [loading, setLoading] = useState(true);

  const [sportsLoading, setSportsLoading] =
    useState(false);

  const [search, setSearch] = useState("");

  const [memberSearch, setMemberSearch] =
    useState("");

  const MEMBERS_PER_PAGE = 10;

  const [memberPage, setMemberPage] = useState(1);

  const [deletingSportId, setDeletingSportId] =
    useState<number | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const data = await getMembers();

      setMembers(data || []);
      setMemberPage(1);
    } catch (error) {
      console.error(
        "Failed to load members:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMemberSports = async (
    member: Member
  ) => {
    try {
      setSportsLoading(true);

      setSelectedMember(member);

      const data = await getMemberSports(
        member.memberId
      );

      setMemberSports(data || []);

      setSearch("");
    } catch (error: any) {
      console.error(
        "Failed to load member sports:",
        error
      );

      alert(
        error?.message ||
        "Unable to load member sports."
      );

      setMemberSports([]);
    } finally {
      setSportsLoading(false);
    }
  };

  const clearSelectedMember = () => {
    setSelectedMember(null);
    setMemberSports([]);
    setSearch("");
  };

  const removeSport = async (
    sportId: number
  ) => {
    if (!selectedMember) {
      return;
    }

    const sport = memberSports.find(
      (item) => item.sportId === sportId
    );

    const sportName =
      sport?.sport?.sportName ||
      "this sport";

    const confirmed = window.confirm(
      `Remove ${selectedMember.name} from ${sportName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingSportId(sportId);

      await deleteMemberSport(
        selectedMember.memberId,
        sportId
      );

      setMemberSports((current) =>
        current.filter(
          (item) =>
            item.sportId !== sportId
        )
      );
    } catch (error: any) {
      console.error(
        "Failed to remove sport:",
        error
      );

      alert(
        error?.message ||
        "Unable to remove sport registration."
      );
    } finally {
      setDeletingSportId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const value = memberSearch
      .trim()
      .toLowerCase();

    if (!value) {
      return members;
    }

    return members.filter(
      (member) =>
        member.name
          ?.toLowerCase()
          .includes(value) ||
        member.email
          ?.toLowerCase()
          .includes(value) ||
        String(member.memberId).includes(value)
    );
  }, [members, memberSearch]);

  const totalMemberPages = Math.ceil(
    filteredMembers.length /
    MEMBERS_PER_PAGE
  );

  const paginatedMembers = useMemo(() => {
    const startIndex =
      (memberPage - 1) *
      MEMBERS_PER_PAGE;

    return filteredMembers.slice(
      startIndex,
      startIndex + MEMBERS_PER_PAGE
    );
  }, [
    filteredMembers,
    memberPage,
  ]);

  const filteredSports = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return memberSports;
    }

    return memberSports.filter(
      (item) =>
        item.sport?.sportName
          ?.toLowerCase()
          .includes(value) ||
        item.sport?.description
          ?.toLowerCase()
          .includes(value)
    );
  }, [memberSports, search]);


  if (loading) {
    return (
      <LoadingSpinner
        text="Loading members..."
      />
    );
  }

  return (
    <div className="space-y-7">

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
          <Trophy size={16} />

          Management
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Member Sports
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View and manage the sports
          registered by each member.
        </p>
      </div>

      {!selectedMember && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="font-semibold text-slate-900">
              Select a Member
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Choose a member to view
              their registered sports.
            </p>

          </div>

          <div className="border-b border-slate-100 p-4">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={memberSearch}
                onChange={(event) => {
                  setMemberSearch(
                    event.target.value
                  );

                  // Always return to page 1
                  // when searching.
                  setMemberPage(1);
                }}
                placeholder="Search members..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          <div className="divide-y divide-slate-100">

            {filteredMembers.length === 0 ? (

              /* No members */

              <div className="px-6 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <UserRound size={22} />
                </div>

                <p className="mt-4 font-semibold text-slate-700">
                  No members found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Try another search.
                </p>

              </div>

            ) : (

              /* Paginated members */

              paginatedMembers.map(
                (member) => (

                  <button
                    key={member.memberId}
                    type="button"
                    onClick={() =>
                      loadMemberSports(
                        member
                      )
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                  >

                    {/* Member information */}

                    <div className="flex items-center gap-3">

                      {/* Avatar */}

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                        {member.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "M"}
                      </div>

                      {/* Details */}

                      <div>

                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Member #
                          {member.memberId}
                          {" · "}
                          {member.email}
                        </p>

                      </div>

                    </div>

                    {/* Arrow */}

                    <div className="text-xl text-slate-400">
                      →
                    </div>

                  </button>

                )
              )

            )}

          </div>

          {filteredMembers.length >
            MEMBERS_PER_PAGE && (

              <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Showing count */}

                <p className="text-sm text-slate-500">

                  Showing{" "}

                  <span className="font-medium text-slate-700">
                    {(memberPage - 1) *
                      MEMBERS_PER_PAGE +
                      1}
                  </span>

                  {" – "}

                  <span className="font-medium text-slate-700">
                    {Math.min(
                      memberPage *
                      MEMBERS_PER_PAGE,
                      filteredMembers.length
                    )}
                  </span>

                  {" of "}

                  <span className="font-medium text-slate-700">
                    {filteredMembers.length}
                  </span>

                  {" "}members

                </p>

                {/* Pagination controls */}

                <div className="flex items-center gap-2">

                  {/* Previous */}

                  <button
                    type="button"
                    onClick={() =>
                      setMemberPage(
                        (page) =>
                          Math.max(
                            page - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      memberPage === 1
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}

                  <div className="flex items-center gap-1">

                    {Array.from(
                      {
                        length:
                          totalMemberPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map((page) => (

                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          setMemberPage(
                            page
                          )
                        }
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${memberPage === page
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        {page}
                      </button>

                    ))}

                  </div>

                  {/* Next */}

                  <button
                    type="button"
                    onClick={() =>
                      setMemberPage(
                        (page) =>
                          Math.min(
                            page + 1,
                            totalMemberPages
                          )
                      )
                    }
                    disabled={
                      memberPage ===
                      totalMemberPages
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>

              </div>

            )}

        </div>
      )}

      {selectedMember && (
        <>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {/* Avatar */}

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                  {selectedMember.name
                    ?.charAt(0)
                    .toUpperCase() ||
                    "M"}
                </div>

                {/* Member information */}

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedMember.name}
                    </h2>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                      Member
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedMember.email}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Member #
                    {selectedMember.memberId}
                  </p>

                </div>

              </div>

              {/* Back button */}

              <button
                type="button"
                onClick={
                  clearSelectedMember
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <ArrowLeft size={16} />

                Back to Members
              </button>

            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Registered Sports */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Registered Sports
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {memberSports.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Sports joined by this
                    member
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Trophy size={21} />
                </div>

              </div>

            </div>

            {/* Member Status */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Member Status
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {selectedMember.status}
                  </p>

                  <p className="mt-1 text-xs text-emerald-500">
                    Account status
                  </p>

                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Users size={21} />
                </div>

              </div>

            </div>

          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Sports Header */}

            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="font-semibold text-slate-900">
                  Registered Sports
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Sports currently associated
                  with this member.
                </p>

              </div>

              {/* Search Sports */}

              <div className="relative w-full lg:w-72">

                <Search
                  size={17}
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
                  placeholder="Search sports..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* Loading */}

            {sportsLoading ? (

              <div className="px-6 py-16">

                <LoadingSpinner
                  text="Loading sports..."
                />

              </div>

            ) : filteredSports.length === 0 ? (

              /* No sports */

              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Trophy size={24} />
                </div>

                <p className="mt-4 font-semibold text-slate-700">
                  No sports registered
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  This member has not joined
                  any sports yet.
                </p>

              </div>

            ) : (

              /* Sports list */

              <div className="divide-y divide-slate-100">

                {filteredSports.map(
                  (item) => (

                    <div
                      key={`${item.memberId}-${item.sportId}`}
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
                    >

                      {/* Sport Information */}

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Trophy size={21} />
                        </div>

                        <div>

                          <h3 className="font-semibold text-slate-900">
                            {
                              item.sport
                                ?.sportName ||
                              "Unknown Sport"
                            }
                          </h3>

                          <p className="mt-1 max-w-xl text-sm text-slate-500">
                            {
                              item.sport
                                ?.description ||
                              "No description available."
                            }
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">

                            <CalendarDays
                              size={13}
                            />

                            Joined{" "}

                            {item.joinedAt
                              ? new Date(
                                item.joinedAt
                              ).toLocaleDateString(
                                "en-GB"
                              )
                              : "—"}

                          </div>

                        </div>

                      </div>

                      {/* Remove Button */}

                      <button
                        type="button"
                        onClick={() =>
                          removeSport(
                            item.sportId
                          )
                        }
                        disabled={
                          deletingSportId ===
                          item.sportId
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {deletingSportId ===
                          item.sportId ? (
                          "Removing..."
                        ) : (
                          <>
                            <Trash2
                              size={16}
                            />

                            Remove
                          </>
                        )}

                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </>
      )}

    </div>
  );
}