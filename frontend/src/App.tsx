import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from "./pages/Home";
import Sports from "./pages/Sports";
import Login from "./pages/Login";
import Facilities from "./pages/Facilities";
import FacilityDetails from "./pages/FacilityDetails";
import Inquiries from "./pages/Inquiries";

// ============================================================
// MEMBER PAGES
// ============================================================

import CreateBooking from "./pages/CreateBooking";
import ProfilePage from "./pages/ProfilePage";
import MyBookings from "./pages/MyBookings";
import MySports from "./pages/MySports";

// ============================================================
// LAYOUT
// ============================================================

import CustomerLayout from "./components/layouts/CustomerLayout";

// ============================================================
// APPLICATION
// ============================================================

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ==================================================
                    PUBLIC ROUTES
                ================================================== */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/sports"
                    element={<Sports />}
                />

                <Route
                    path="/facilities"
                    element={<Facilities />}
                />

                <Route
                    path="/facility/:id"
                    element={<FacilityDetails />}
                />

                <Route
                    path="/inquiries"
                    element={<Inquiries />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* ==================================================
                    MEMBER ROUTES
                ================================================== */}

                <Route
                    element={<CustomerLayout />}
                >
                    <Route
                        path="/profile"
                        element={<ProfilePage />}
                    />

                    <Route
                        path="/profile/bookings"
                        element={<MyBookings />}
                    />

                    <Route
                        path="/profile/sports"
                        element={<MySports />}
                    />

                    <Route
                        path="/bookings/create"
                        element={<CreateBooking />}
                    />
                </Route>

                {/* ==================================================
                    FALLBACK
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}