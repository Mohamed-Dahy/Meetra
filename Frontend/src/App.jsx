import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import MeetraAuthPage from "./pages/MeetraAuthPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

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
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* ── 404 — shows a proper not-found page instead of silently
              redirecting to / which hides broken links ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppShell />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d0d1a',
            border: '1px solid rgba(99,102,241,0.25)',
            color: '#f1f5f9',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;