import { getCurrentAdmin } from "../services/api";

export default function Profile() {

  const admin = getCurrentAdmin();

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Profile
        </h1>

        <p className="mt-2 text-gray-500">
          Administrator account information.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <p>
          <strong>Name:</strong>{" "}
          {admin?.firstName}{" "}
          {admin?.lastName}
        </p>

        <p className="mt-3">
          <strong>Email:</strong>{" "}
          {admin?.email || "—"}
        </p>

        <p className="mt-3">
          <strong>Role:</strong>{" "}
          {admin?.role || "Admin"}
        </p>

      </div>

    </div>
  );
}