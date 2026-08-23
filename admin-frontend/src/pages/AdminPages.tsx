import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Star,
  Trash2,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  
  createFacility,
  createSport,
  deleteBooking,
  deleteFacility,
  deleteInquiry,
  deleteMember,
  deleteReview,
  deleteSport,
  getBookings,
  getFacilities,
  getInquiries,
  getMembers,
  getReviews,
  getSports,
  updateFacility,
  updateInquiry,
  updateMember,
  updateReview,
  updateSport,
} from "../services/api";

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-sm font-semibold text-blue-600">
          {eyebrow}
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function Loading() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      <p className="text-sm text-slate-500">
        Loading...
      </p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle size={18} />
      {message}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Activity
          size={22}
          className="text-slate-400"
        />
      </div>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let className =
    "bg-slate-100 text-slate-600";

  if (
    normalized === "active" ||
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "resolved"
  ) {
    className =
      "bg-emerald-50 text-emerald-600";
  }

  if (
    normalized === "pending" ||
    normalized === "processing"
  ) {
    className =
      "bg-amber-50 text-amber-600";
  }

  if (
    normalized === "cancelled" ||
    normalized === "inactive" ||
    normalized === "rejected"
  ) {
    className =
      "bg-red-50 text-red-600";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        rows={rows}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
    </div>
  );
}

function TableShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        size={17}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMembers(),
      getSports(),
      getFacilities(),
      getBookings(),
      getReviews(),
      getInquiries(),
    ])
      .then(
        ([
          membersData,
          sportsData,
          facilitiesData,
          bookingsData,
          reviewsData,
          inquiriesData,
        ]) => {
          setMembers(membersData);
          setSports(sportsData);
          setFacilities(facilitiesData);
          setBookings(bookingsData);
          setReviews(reviewsData);
          setInquiries(inquiriesData);
        }
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }

  const pendingInquiries =
    inquiries.filter(
      (item) =>
        item.status.toLowerCase() ===
        "pending"
    ).length;

  const activeFacilities =
    facilities.filter(
      (item) =>
        item.status.toLowerCase() ===
        "active"
    ).length;

  const confirmedBookings =
    bookings.filter(
      (item) =>
        item.status.toLowerCase() ===
        "confirmed"
    ).length;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Dashboard"
        description="Overview of your community sports platform."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Members"
          value={members.length}
          description="Registered community members"
          icon={<Users size={21} />}
        />

        <StatCard
          title="Facilities"
          value={activeFacilities}
          description="Active sports facilities"
          icon={<Building2 size={21} />}
        />

        <StatCard
          title="Sports"
          value={sports.length}
          description="Sports available"
          icon={<Trophy size={21} />}
        />

        <StatCard
          title="Bookings"
          value={confirmedBookings}
          description="Confirmed bookings"
          icon={<CalendarDays size={21} />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Platform Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the most important parts of your sports community.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <OverviewCard
              title="Facilities"
              description="Add, edit and manage community sports facilities."
              icon={<Building2 size={21} />}
              href="/facilities"
            />

            <OverviewCard
              title="Members"
              description="View and manage registered members."
              icon={<Users size={21} />}
              href="/members"
            />

            <OverviewCard
              title="Bookings"
              description="Monitor facility bookings."
              icon={<CalendarDays size={21} />}
              href="/bookings"
            />

            <OverviewCard
              title="Sports"
              description="Manage sports offered by the community."
              icon={<Trophy size={21} />}
              href="/sports"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            System Status
          </h2>

          <div className="mt-5 space-y-5">
            <SystemRow
              label="API"
              value="Online"
              success
            />

            <SystemRow
              label="Database"
              value="Connected"
              success
            />

            <SystemRow
              label="Reviews"
              value={`${reviews.length} total`}
            />

            <SystemRow
              label="Inquiries"
              value={`${pendingInquiries} pending`}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function OverviewCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl bg-slate-50 p-5 transition hover:bg-blue-50"
    >
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
        />
      </div>
    </a>
  );
}

function SystemRow({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {success ? (
            <CheckCircle2 size={16} />
          ) : (
            <Activity size={16} />
          )}
        </span>

        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
      </div>

      <span
        className={`text-sm font-semibold ${
          success
            ? "text-emerald-600"
            : "text-slate-500"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Sport | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const load = async () => {
    setLoading(true);

    try {
      setSports(await getSports());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      sports.filter((sport) =>
        `${sport.sportName} ${sport.description || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [sports, search]
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  const openEdit = (sport: Sport) => {
    setEditing(sport);
    setName(sport.sportName);
    setDescription(sport.description || "");
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await updateSport(editing.sportId, {
          ...editing,
          sportName: name,
          description,
        });
      } else {
        await createSport({
          sportName: name,
          description,
        });
      }

      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this sport?"
      )
    ) {
      return;
    }

    try {
      await deleteSport(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Sports"
        description="Manage sports offered by the community."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Sport
          </button>
        }
      />

      {error && <ErrorBox message={error} />}

      <div className="mb-5 max-w-md">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search sports..."
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TableShell>
          {filtered.length === 0 ? (
            <EmptyState
              title="No sports found"
              description="Add a sport to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Sport
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Description
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((sport) => (
                    <tr
                      key={sport.sportId}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {sport.sportId}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {sport.sportName}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {sport.description || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(sport)
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            onClick={() =>
                              remove(sport.sportId)
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TableShell>
      )}

      {showModal && (
        <Modal
          title={
            editing
              ? "Edit Sport"
              : "Add Sport"
          }
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-5">
            <Field
              label="Sport Name"
              value={name}
              onChange={setName}
              required
            />

            <TextArea
              label="Description"
              value={description}
              onChange={setDescription}
              rows={4}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={save}
                disabled={!name.trim()}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Save Sport
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export function FacilitiesPage() {
  const [facilities, setFacilities] =
    useState<Facility[]>([]);
  const [sports, setSports] =
    useState<Sport[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] =
    useState<Facility | null>(null);
  const [showModal, setShowModal] =
    useState(false);

  const [sportId, setSportId] = useState("");
  const [facilityName, setFacilityName] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [address, setAddress] =
    useState("");
  const [openingTime, setOpeningTime] =
    useState("");
  const [closingTime, setClosingTime] =
    useState("");
  const [status, setStatus] =
    useState("Active");

  const load = async () => {
    setLoading(true);

    try {
      const [facilityData, sportData] =
        await Promise.all([
          getFacilities(),
          getSports(),
        ]);

      setFacilities(facilityData);
      setSports(sportData);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = facilities.filter(
    (facility) =>
      `${facility.facilityName} ${facility.location} ${
        facility.sport?.sportName || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setSportId(
      sports[0]
        ? String(sports[0].sportId)
        : ""
    );
    setFacilityName("");
    setDescription("");
    setLocation("");
    setAddress("");
    setOpeningTime("");
    setClosingTime("");
    setStatus("Active");
    setShowModal(true);
  };

  const openEdit = (facility: Facility) => {
    setEditing(facility);
    setSportId(String(facility.sportId));
    setFacilityName(facility.facilityName);
    setDescription(
      facility.description || ""
    );
    setLocation(facility.location);
    setAddress(facility.address || "");
    setOpeningTime(
      facility.openingTime || ""
    );
    setClosingTime(
      facility.closingTime || ""
    );
    setStatus(facility.status);
    setShowModal(true);
  };

  const save = async () => {
    try {
      const data = {
        sportId: Number(sportId),
        facilityName,
        description,
        location,
        address,
        openingTime,
        closingTime,
        status,
      };

      if (editing) {
        await updateFacility(
          editing.facilityId,
          {
            ...editing,
            ...data,
          }
        );
      } else {
        await createFacility(data);
      }

      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this facility?"
      )
    ) {
      return;
    }

    try {
      await deleteFacility(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Facilities"
        description="Manage sports facilities, locations and opening hours."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Facility
          </button>
        }
      />

      {error && <ErrorBox message={error} />}

      <div className="mb-5 max-w-md">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search facilities..."
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TableShell>
          {filtered.length === 0 ? (
            <EmptyState
              title="No facilities found"
              description="Add a facility to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Facility
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Sport
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Hours
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((facility) => (
                    <tr
                      key={facility.facilityId}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {facility.facilityName}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {facility.description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {facility.sport?.sportName ||
                          "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} />
                          {facility.location}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {facility.openingTime ||
                          "—"}{" "}
                        -{" "}
                        {facility.closingTime ||
                          "—"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            facility.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(facility)
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            onClick={() =>
                              remove(
                                facility.facilityId
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TableShell>
      )}

      {showModal && (
        <Modal
          title={
            editing
              ? "Edit Facility"
              : "Add Facility"
          }
          onClose={() =>
            setShowModal(false)
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Sport"
              value={sportId}
              onChange={setSportId}
            >
              <option value="">
                Select sport
              </option>

              {sports.map((sport) => (
                <option
                  key={sport.sportId}
                  value={sport.sportId}
                >
                  {sport.sportName}
                </option>
              ))}
            </SelectField>

            <Field
              label="Facility Name"
              value={facilityName}
              onChange={setFacilityName}
              required
            />

            <Field
              label="Location"
              value={location}
              onChange={setLocation}
              required
            />

            <Field
              label="Address"
              value={address}
              onChange={setAddress}
            />

            <Field
              label="Opening Time"
              value={openingTime}
              onChange={setOpeningTime}
              type="time"
            />

            <Field
              label="Closing Time"
              value={closingTime}
              onChange={setClosingTime}
              type="time"
            />

            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
            >
              <option value="Active">
                Active
              </option>
              <option value="Inactive">
                Inactive
              </option>
            </SelectField>

            <div />

            <div className="md:col-span-2">
              <TextArea
                label="Description"
                value={description}
                onChange={setDescription}
              />
            </div>

            <div className="flex justify-end gap-3 md:col-span-2">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={save}
                disabled={
                  !sportId ||
                  !facilityName ||
                  !location
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Save Facility
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export function MembersPage() {
  const [members, setMembers] =
    useState<Member[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] =
    useState<Member | null>(null);
  const [showModal, setShowModal] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] =
    useState("Active");

  const load = async () => {
    setLoading(true);

    try {
      setMembers(await getMembers());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = members.filter(
    (member) =>
      `${member.name} ${member.email} ${
        member.phone || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const openEdit = (member: Member) => {
    setEditing(member);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone || "");
    setStatus(member.status);
    setShowModal(true);
  };

  const save = async () => {
    if (!editing) {
      return;
    }

    try {
      await updateMember(
        editing.memberId,
        {
          memberId: editing.memberId,
          name,
          email,
          phone,
          status,
        }
      );

      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this member?"
      )
    ) {
      return;
    }

    try {
      await deleteMember(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Members"
        description="View and manage registered community members."
      />

      {error && <ErrorBox message={error} />}

      <div className="mb-5 max-w-md">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search members..."
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TableShell>
          {filtered.length === 0 ? (
            <EmptyState
              title="No members found"
              description="There are no members matching your search."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Member
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((member) => (
                    <tr
                      key={member.memberId}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                            {member.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {member.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID {member.memberId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {member.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {member.phone || "No phone"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {member.userRole ||
                          "Member"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            member.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEdit(member)
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            onClick={() =>
                              remove(
                                member.memberId
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TableShell>
      )}

      {showModal && editing && (
        <Modal
          title="Edit Member"
          onClose={() =>
            setShowModal(false)
          }
        >
          <div className="space-y-5">
            <Field
              label="Name"
              value={name}
              onChange={setName}
              required
            />

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              required
            />

            <Field
              label="Phone"
              value={phone}
              onChange={setPhone}
            />

            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
            >
              <option value="Active">
                Active
              </option>
              <option value="Inactive">
                Inactive
              </option>
            </SelectField>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={save}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export function BookingsPage() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);

    try {
      setBookings(await getBookings());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = bookings.filter(
    (booking) =>
      `${booking.bookingId} ${
        booking.member?.name || ""
      } ${booking.member?.email || ""} ${
        booking.facility?.facilityName || ""
      } ${booking.status}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const cancel = async (id: number) => {
    if (
      !window.confirm(
        "Cancel this booking?"
      )
    ) {
      return;
    }

    try {
      await cancelBookingAsAdmin(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        "Delete this booking permanently?"
      )
    ) {
      return;
    }

    try {
      await deleteBooking(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Bookings"
        description="Monitor and manage facility bookings."
      />

      {error && <ErrorBox message={error} />}

      <div className="mb-5 max-w-md">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search bookings..."
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TableShell>
          {filtered.length === 0 ? (
            <EmptyState
              title="No bookings found"
              description="There are no bookings matching your search."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Booking
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Member
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Facility
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Time
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        #{booking.bookingId}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {booking.member?.name ||
                            "Unknown"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {booking.member?.email ||
                            ""}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {booking.facility
                            ?.facilityName ||
                            "Unknown"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {booking.facility?.location ||
                            ""}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(
                          booking.bookingDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {booking.startTime} -{" "}
                        {booking.endTime}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            booking.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {booking.status.toLowerCase() !==
                            "cancelled" && (
                            <button
                              onClick={() =>
                                cancel(
                                  booking.bookingId
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              title="Cancel booking"
                            >
                              <X size={17} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              remove(
                                booking.bookingId
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete booking"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TableShell>
      )}
    </>
  );
}

async function cancelBookingAsAdmin(
  id: number
) {
  const token =
    localStorage.getItem("adminToken");

  const response = await fetch(
    `https://localhost:7252/api/AdminBookings/${id}/cancel`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || "Unable to cancel booking."
    );
  }
}

export function ReviewsPage() {
  const [reviews, setReviews] =
    useState<Review[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);

    try {
      setReviews(await getReviews());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = reviews.filter(
    (review) =>
      `${review.member?.name || ""} ${
        review.facility?.facilityName || ""
      } ${review.commentText || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const remove = async (id: number) => {
    if (
      !window.confirm(
        "Delete this review?"
      )
    ) {
      return;
    }

    try {
      await deleteReview(id);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Reviews"
        description="Review feedback submitted by community members."
      />

      {error && <ErrorBox message={error} />}

      <div className="mb-5 max-w-md">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search reviews..."
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TableShell>
          {filtered.length === 0 ? (
            <EmptyState
              title="No reviews found"
              description="No member reviews are currently available."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((review) => (
                <div
                  key={review.reviewId}
                  className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Star
                          size={19}
                          fill="currentColor"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.member?.name ||
                            "Member"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {review.facility
                            ?.facilityName ||
                            "Facility"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <=
                              review.rating
                                ? "text-amber-500"
                                : "text-slate-200"
                            }
                            fill={
                              star <=
                              review.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )
                      )}
                    </div>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      {review.commentText ||
                        "No comment provided."}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      remove(review.reviewId)
                    }
                    className="self-end rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TableShell>
      )}
    </>
  );
}

export function InquiriesPage() {
  const [inquiries, setInquiries] =
    useState<Inquiry[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] =
    useState<Inquiry | null>(null);

  const load = async () => {
    setLoading(true);

    try {
      setInquiries(await getInquiries());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = inquiries.filter(
    (item) =>
      `${item.name} ${item.email} ${
        item.subject
      } ${item.message} ${item.status}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const changeStatus = async (
    inquiry: Inquiry,
    status: string
  ) => {
    try {
      await updateInquiry(
        inquiry.inquiryId,
        {
          ...inquiry,
          status,
        }
      );

      await load();

      setSelected({
        ...inquiry,
        status,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async (id: number) => {
    if (
      !window.confirm(
        "Delete this inquiry?"
      )
    ) {
      return;
    }

    try {
      await deleteInquiry(id);
      setSelected(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Inquiries"
        description="Manage questions and messages submitted by users."
      />

      {error && <ErrorBox message={error} />}

      <div className="mb-5 max-w-md">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search inquiries..."
        />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <TableShell>
          {filtered.length === 0 ? (
            <EmptyState
              title="No inquiries found"
              description="There are no inquiries matching your search."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div
                  key={item.inquiryId}
                  className="flex items-start gap-4 p-5 transition hover:bg-slate-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MessageSquare size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {item.subject}
                      </h3>

                      <StatusBadge
                        status={item.status}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>
                        {item.name}
                      </span>

                      <span className="flex items-center gap-1">
                        <Mail size={13} />
                        {item.email}
                      </span>

                      <span>
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() =>
                        setSelected(item)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() =>
                        remove(item.inquiryId)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TableShell>
      )}

      {selected && (
        <Modal
          title="Inquiry Details"
          onClose={() =>
            setSelected(null)
          }
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Subject
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {selected.subject}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selected.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selected.email}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Message
              </p>

              <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {selected.message}
              </div>
            </div>

            <SelectField
              label="Status"
              value={selected.status}
              onChange={(value) =>
                changeStatus(
                  selected,
                  value
                )
              }
            >
              <option value="Pending">
                Pending
              </option>
              <option value="Processing">
                Processing
              </option>
              <option value="Resolved">
                Resolved
              </option>
              <option value="Closed">
                Closed
              </option>
            </SelectField>

            <div className="flex justify-end">
              <button
                onClick={() =>
                  setSelected(null)
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export function SettingsPage() {
  const [admin, setAdmin] =
    useState<Member | null>(null);

  useEffect(() => {
    const value =
      localStorage.getItem(
        "adminMember"
      );

    if (value) {
      try {
        setAdmin(JSON.parse(value));
      } catch {
        setAdmin(null);
      }
    }
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="View administration account and system information."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <UserRound size={26} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Administrator Profile
              </h2>

              <p className="text-sm text-slate-500">
                Current administrator account.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Name
              </p>

              <p className="mt-1 text-sm text-slate-800">
                {admin?.name || "Administrator"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 text-sm text-slate-800">
                {admin?.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Role
              </p>

              <p className="mt-1 text-sm font-semibold text-blue-600">
                Administrator
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <div className="mt-1">
                <StatusBadge
                  status={
                    admin?.status ||
                    "Active"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Activity size={26} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                System Information
              </h2>

              <p className="text-sm text-slate-500">
                Application environment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <SystemRow
              label="Application"
              value="SportsHub"
            />

            <SystemRow
              label="Environment"
              value="Development"
            />

            <SystemRow
              label="Backend"
              value="ASP.NET Core"
            />

            <SystemRow
              label="Database"
              value="Oracle"
            />

            <SystemRow
              label="Authentication"
              value="JWT"
            />
          </div>
        </div>
      </div>
    </>
  );
}