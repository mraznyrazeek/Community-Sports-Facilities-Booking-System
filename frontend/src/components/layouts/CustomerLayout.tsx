import { Outlet } from "react-router-dom";
import CustomerNavbar from "../navigation/CustomerNavbar";
import PublicNavbar from "../navigation/PublicNavbar";
import { getCurrentMember, isAuthenticated } from "../../services/api";

export default function CustomerLayout() {
    const member = getCurrentMember();

    const isLoggedInMember =
        isAuthenticated() &&
        member?.role?.toLowerCase() === "member";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* Navigation */}
            {isLoggedInMember ? (
                <CustomerNavbar />
            ) : (
                <PublicNavbar />
            )}

            {/* Main Application Content */}
            <main className="min-h-[calc(100vh-72px)]">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex min-h-16 max-w-7xl flex-col items-center justify-center gap-1 px-4 py-4 text-center sm:flex-row sm:justify-between sm:px-6 lg:px-8">

                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Community Sports. All rights reserved.
                    </p>

                    <p className="text-xs text-slate-400">
                        Community • Sports • Together
                    </p>

                </div>
            </footer>

        </div>
    );
}