import { useEffect, useState } from "react";

import {
  Users,
  Trash2,
} from "lucide-react";

import {
  getMembers,
  deleteMember,
} from "../services/api";

import LoadingSpinner from "../components/LoadingSpinner";

export default function Members() {

  const [members, setMembers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function loadMembers() {

      try {

        const data = await getMembers();

        setMembers(data || []);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    loadMembers();

  }, []);

  const removeMember = async (
    id: number
  ) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this member?"
      )
    ) {
      return;
    }

    try {

      await deleteMember(id);

      setMembers(
        members.filter(
          (member) =>
            member.memberId !== id
        )
      );

    } catch (error: any) {

      alert(
        error?.message ||
        "Unable to delete member."
      );

    }

  };

  if (loading) {
    return (
      <LoadingSpinner text="Loading members..." />
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Members
        </h1>

        <p className="mt-2 text-gray-500">
          Manage registered community members.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Member
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs uppercase text-gray-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {members.map(
                (member) => (

                  <tr
                    key={member.memberId}
                    className="border-t border-gray-100"
                  >

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                          <Users size={18} />
                        </div>

                        <div>

                          <p className="font-semibold text-gray-900">
                            {member.firstName}{" "}
                            {member.lastName}
                          </p>

                          <p className="text-xs text-gray-400">
                            #{member.memberId}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {member.email || "—"}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {member.phone || "—"}
                    </td>

                    <td className="px-6 py-5">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {member.role ||
                          "Member"}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <button
                        onClick={() =>
                          removeMember(
                            member.memberId
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}