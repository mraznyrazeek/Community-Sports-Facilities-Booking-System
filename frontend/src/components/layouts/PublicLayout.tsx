import { Outlet } from "react-router-dom";
import PublicNavbar from "../navigation/PublicNavbar";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <PublicNavbar />

            <main>
                <Outlet />
            </main>
        </div>
    );
}