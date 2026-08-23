import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";

import {
  BookingsPage,
  Dashboard,
  FacilitiesPage,
  InquiriesPage,
  MembersPage,
  ReviewsPage,
  SettingsPage,
  SportsPage,
} from "./pages/AdminPages";

import { isAuthenticated } from "./services/api";

function ProtectedRoutes() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={<ProtectedRoutes />}
      >
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/sports"
          element={<SportsPage />}
        />

        <Route
          path="/facilities"
          element={<FacilitiesPage />}
        />

        <Route
          path="/bookings"
          element={<BookingsPage />}
        />

        <Route
          path="/members"
          element={<MembersPage />}
        />

        <Route
          path="/reviews"
          element={<ReviewsPage />}
        />

        <Route
          path="/inquiries"
          element={<InquiriesPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}