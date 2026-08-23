import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Facilities from "./pages/Facilities";
import Sports from "./pages/Sports";
import MyBookings from "./pages/MyBookings";
import MySports from "./pages/MySports";
import Reviews from "./pages/Reviews";
import Inquiries from "./pages/Inquiries";
import Profile from "./pages/Profile";
import FacilityDetails from "./pages/FacilityDetails";

import { isAuthenticated } from "./services/api";

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ==============================
                    PUBLIC ROUTES
                ============================== */}

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
                    path="/reviews"
                    element={<Reviews />}
                />

                <Route
                    path="/inquiries"
                    element={<Inquiries />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==============================
                    MEMBER ROUTES
                ============================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bookings"
                    element={
                        <ProtectedRoute>
                            <MyBookings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-sports"
                    element={
                        <ProtectedRoute>
                            <MySports />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                {/* ==============================
                    UNKNOWN ROUTES
                ============================== */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}