import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Clock,
  Trophy,
  X,
} from "lucide-react";

import {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  getSports,
  type Facility,
  type Sport,
} from "../services/api";

import LoadingSpinner from "../components/common/LoadingSpinner";

type FacilityForm = {
  sportId: number;
  facilityName: string;
  description: string;
  location: string;
  address: string;
  openingTime: string;
  closingTime: string;
  status: string;
};

const emptyForm: FacilityForm = {
  sportId: 0,
  facilityName: "",
  description: "",
  location: "",
  address: "",
  openingTime: "",
  closingTime: "",
  status: "Active",
};

export default function Facilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<FacilityForm>(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    try {
      const [facilityData, sportData] = await Promise.all([
        getFacilities(),
        getSports(),
      ]);

      setFacilities(facilityData || []);
      setSports(sportData || []);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load facilities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (
    field: keyof FacilityForm,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (facility: Facility) => {
    setEditingId(facility.facilityId);

    setForm({
      sportId: facility.sportId,
      facilityName: facility.facilityName || "",
      description: facility.description || "",
      location: facility.location || "",
      address: facility.address || "",
      openingTime: facility.openingTime || "",
      closingTime: facility.closingTime || "",
      status: facility.status || "Active",
    });

    setShowForm(true);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.sportId) {
      alert("Please select a sport.");
      return;
    }

    if (!form.facilityName.trim()) {
      alert("Please enter a facility name.");
      return;
    }

    if (!form.location.trim()) {
      alert("Please enter the facility location.");
      return;
    }

    try {
      setSaving(true);

      if (editingId !== null) {
        await updateFacility(editingId, {
          facilityId: editingId,
          ...form,
        });

        alert("Facility updated successfully.");
      } else {
        await createFacility(form);

        alert("Facility created successfully.");
      }

      resetForm();

      setLoading(true);
      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save facility."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const facility = facilities.find(
      (item) => item.facilityId === id
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${facility?.facilityName || "this facility"}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFacility(id);

      setFacilities((current) =>
        current.filter(
          (item) => item.facilityId !== id
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete facility."
      );
    }
  };

  const filteredFacilities = facilities.filter(
    (facility) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        facility.facilityName
          .toLowerCase()
          .includes(searchValue) ||
        facility.location
          .toLowerCase()
          .includes(searchValue) ||
        facility.sport?.sportName
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        facility.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    }
  );

  if (loading) {
    return (
      <LoadingSpinner text="Loading facilities..." />
    );
  }

  return (
    <div className="space-y-7">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  <div>

    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
      Facilities
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      Manage sports facilities, locations and operating hours.
    </p>
  </div>

  <button
    type="button"
    onClick={handleAdd}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
  >
    <Plus size={18} />
    Add Facility
  </button>
</div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Facilities
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {facilities.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {
              facilities.filter(
                (facility) =>
                  facility.status?.toLowerCase() ===
                  "active"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inactive
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-500">
            {
              facilities.filter(
                (facility) =>
                  facility.status?.toLowerCase() !==
                  "active"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">

        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search facilities, locations or sports..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingId !== null
                  ? "Edit Facility"
                  : "Add New Facility"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the facility information below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6"
          >
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sport
                </label>

                <select
                  value={form.sportId}
                  onChange={(event) =>
                    handleChange(
                      "sportId",
                      Number(event.target.value)
                    )
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={0}>
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
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Facility Name
                </label>

                <input
                  value={form.facilityName}
                  onChange={(event) =>
                    handleChange(
                      "facilityName",
                      event.target.value
                    )
                  }
                  required
                  placeholder="e.g. Main Tennis Court"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    handleChange(
                      "description",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Describe the facility..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <input
                  value={form.location}
                  onChange={(event) =>
                    handleChange(
                      "location",
                      event.target.value
                    )
                  }
                  required
                  placeholder="e.g. Colombo"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Address
                </label>

                <input
                  value={form.address}
                  onChange={(event) =>
                    handleChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Full address"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Opening Time
                </label>

                <input
                  type="time"
                  value={form.openingTime}
                  onChange={(event) =>
                    handleChange(
                      "openingTime",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Closing Time
                </label>

                <input
                  type="time"
                  value={form.closingTime}
                  onChange={(event) =>
                    handleChange(
                      "closingTime",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    handleChange(
                      "status",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Facility"
                    : "Create Facility"}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {filteredFacilities.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Building2 size={30} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No facilities found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {search || statusFilter !== "All"
              ? "Try changing your search or filter."
              : "Start by adding your first sports facility."}
          </p>

          {!search &&
            statusFilter === "All" && (
              <button
                type="button"
                onClick={handleAdd}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Facility
              </button>
            )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredFacilities.map(
            (facility) => (
              <div
                key={facility.facilityId}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="h-2 bg-blue-600" />

                <div className="p-6">

                  <div className="flex items-start justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Building2 size={23} />
                    </div>

                    <div className="flex items-center gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            facility
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Edit facility"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            facility.facilityId
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete facility"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-3">

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {facility.facilityName}
                      </h3>

                      {facility.sport && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                          <Trophy size={13} />
                          {facility.sport.sportName}
                        </div>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        facility.status?.toLowerCase() ===
                        "active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {facility.status}
                    </span>
                  </div>

                  <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-500">
                    {facility.description ||
                      "No description available."}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">

                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p className="font-medium">
                          {facility.location}
                        </p>

                        {facility.address && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {facility.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock
                        size={17}
                        className="text-slate-400"
                      />

                      <span>
                        {facility.openingTime ||
                        facility.closingTime
                          ? `${facility.openingTime || "--"} - ${facility.closingTime || "--"}`
                          : "Opening hours not set"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="pb-5 text-center text-xs text-slate-400">
        Showing {filteredFacilities.length} of{" "}
        {facilities.length} facilities
      </div>
    </div>
  );
}