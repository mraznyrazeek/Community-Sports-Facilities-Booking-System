import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Search,
  X,
  Save,
  Loader2,
  MoreVertical,
  Dumbbell,
  Users,
  Building2,
} from "lucide-react";

import {
  getSports,
  createSport,
  updateSport,
  deleteSport,
} from "../services/api";

type Sport = {
  sportId: number;
  sportName: string;
  description?: string;
};

type SportForm = {
  sportName: string;
  description: string;
};

export default function Sports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<SportForm>({
    sportName: "",
    description: "",
  });

  const [error, setError] = useState("");

  const loadSports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSports();

      setSports(data || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load sports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  const filteredSports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sports;
    }

    return sports.filter(
      (sport) =>
        sport.sportName?.toLowerCase().includes(query) ||
        sport.description?.toLowerCase().includes(query)
    );
  }, [sports, search]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      sportName: "",
      description: "",
    });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (sport: Sport) => {
    setEditingId(sport.sportId);

    setForm({
      sportName: sport.sportName || "",
      description: sport.description || "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);

    setForm({
      sportName: "",
      description: "",
    });

    setError("");
  };

  const handleSubmit = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  const name = form.sportName.trim();
  const description = form.description.trim();

  if (!name) {
    setError("Sport name is required.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    if (editingId !== null) {
      await updateSport(editingId, {
        sportId: editingId,
        sportName: name,
        description,
      });
    } else {
      await createSport({
        sportName: name,
        description,
      });
    }

    closeForm();
    await loadSports();
  } catch (err: any) {
    setError(
      err?.message ||
        (editingId !== null
          ? "Unable to update sport."
          : "Unable to create sport.")
    );
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (sport: Sport) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${sport.sportName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(sport.sportId);
      setError("");

      await deleteSport(sport.sportId);

      setSports((current) =>
        current.filter(
          (item) => item.sportId !== sport.sportId
        )
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to delete this sport. It may be used by facilities or members."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2
              size={24}
              className="animate-spin text-blue-600"
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading sports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Trophy size={16} />
            Community Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sports
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage the sports available across your community
            facilities.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <Plus size={18} />
          Add Sport
        </button>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Sports
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {sports.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Trophy size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Sports available in the system
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Community Activities
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {sports.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Activities managed by administrators
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Management
              </p>

              <p className="mt-2 text-lg font-bold text-emerald-600">
                Active
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 size={21} />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Sports can be created, edited and removed
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Available Sports
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredSports.length}{" "}
              {filteredSports.length === 1
                ? "sport"
                : "sports"}{" "}
              shown
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search sports..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {filteredSports.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              {search ? (
                <Search size={28} />
              ) : (
                <Dumbbell size={28} />
              )}
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              {search
                ? "No sports found"
                : "No sports available"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try changing your search term."
                : "Add your first sport to start managing community activities."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Add Sport
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSports.map((sport) => (
              <div
                key={sport.sportId}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Trophy size={22} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(sport)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Edit sport"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId === sport.sportId
                      }
                      onClick={() =>
                        handleDelete(sport)
                      }
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete sport"
                    >
                      {deletingId ===
                      sport.sportId ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-slate-900">
                      {sport.sportName}
                    </h3>

                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  </div>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {sport.description ||
                      "No description available for this sport."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-400">
                    Sport ID
                  </span>

                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    #{sport.sportId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId !== null
                    ? "Edit Sport"
                    : "Add New Sport"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId !== null
                    ? "Update the sport information below."
                    : "Add a new sport to your community."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sport Name
                </label>

                <input
                  type="text"
                  value={form.sportName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sportName:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. Football"
                  maxLength={100}
                  required
                  autoFocus
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Describe this sport..."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {form.description.length}/500
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingId !== null
                        ? "Save Changes"
                        : "Create Sport"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}