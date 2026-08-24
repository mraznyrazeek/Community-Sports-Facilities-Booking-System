import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Sports from "./pages/Sports";
import Facilities from "./pages/Facilities";
import Bookings from "./pages/Bookings";
import Members from "./pages/Members";
import Reviews from "./pages/Reviews";
import Inquiries from "./pages/Inquiries";
import Settings from "./pages/Settings";

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
      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected Admin Routes */}
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
          element={<Sports />}
        />

        <Route
          path="/facilities"
          element={<Facilities />}
        />

        <Route
          path="/bookings"
          element={<Bookings />}
        />

        <Route
          path="/members"
          element={<Members />}
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
        path="/settings"
        element={<Settings />}
      />
      
      </Route>

     

      {/* Unknown routes */}
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