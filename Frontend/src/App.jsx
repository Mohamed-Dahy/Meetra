import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import MeetraAuthPage from "./pages/MeetraAuthPage";
import Dashboard from "./pages/Dashboard";

/**
 * Navbar is only shown on public / marketing pages.
 * The Dashboard has its own sidebar + topbar, so we exclude it there.
 */
const PUBLIC_PATHS = ["/", "/auth"];

function AppShell() {
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.some(p => location.pathname === p);

  return (
    <>
      {isPublic && <Navbar />}

      <Routes>
        {/* ── Public ── */}
        <Route path="/"     element={<LandingPage />} />
        <Route path="/auth" element={<MeetraAuthPage />} />

        {/* ── Protected ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </BrowserRouter>
);

export default App;