import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
    const member = JSON.parse(localStorage.getItem("member") || "null");

    return (
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6">
            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    placeholder="Search facilities, sports..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
            </div>

            {/* Right side */}
            <div className="ml-6 flex items-center gap-5">
                <button className="relative rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
                    <Bell size={21} />

                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />
                </button>

                <div className="flex items-center gap-3">
                    <UserCircle size={38} className="text-gray-400" />

                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">
                            {member?.name || "Member"}
                        </p>

                        <p className="text-xs text-gray-500">
                            {member?.email || "Welcome back"}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}