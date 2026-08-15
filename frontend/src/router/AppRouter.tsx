import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";
import PublicProfile from "../pages/PublicProfile";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/users/:id"
        element={<PublicProfile />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

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
  );
}