import { UserCircle } from "lucide-react";

export default function Profile() {
    const member = JSON.parse(
        localStorage.getItem("member") || "null"
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Profile
                </h1>

                <p className="mt-2 text-gray-500">
                    View your account information.
                </p>
            </div>

            <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
                <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
                    <UserCircle
                        size={70}
                        className="text-gray-300"
                    />

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {member?.name || "Member"}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {member?.email}
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-5">
                    <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                            Member ID
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {member?.memberId || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                            Name
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {member?.name || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                            Email
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {member?.email || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                            Phone
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {member?.phone || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase text-gray-400">
                            Account Status
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
                            {member?.status || "Active"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}