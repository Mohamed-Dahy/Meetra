// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import MobileMenu from "./MobileMenu";

/**
 * Navbar — public landing page nav.
 *
 * When the user IS authenticated it shows a workspace-aware right side:
 *   "My Workspaces  ›  Go to Dashboard"
 * When not authenticated it shows the standard Sign in / Get started flow.
 *
 * The component intentionally stays out of the dashboard shell
 * (Dashboard.jsx has its own sidebar + topbar). It is only rendered
 * on public/marketing pages (/, /pricing, /about, etc.).
 */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');

  .nav-glass {
    background: rgba(4,4,12,0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(99,102,241,0.12);
    box-shadow: 0 4px 32px rgba(0,0,0,0.25);
  }

  .nav-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    color: #94a3b8; cursor: pointer;
    transition: color 0.2s; background: none; border: none;
    padding: 0;
  }
  .nav-link:hover { color: #f1f5f9; }

  .nav-btn-ghost {
    font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #94a3b8; cursor: pointer;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 8px 18px;
    transition: all 0.2s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .nav-btn-ghost:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #f1f5f9; }

  .nav-btn-primary {
    font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 600; color: #fff;
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    border: none; border-radius: 10px; padding: 8px 18px;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 0 20px rgba(99,102,241,0.3);
    text-decoration: none; display: inline-flex; align-items: center; gap: 7px;
  }
  .nav-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 32px rgba(99,102,241,0.5); }

  /* Workspace pill (shown when authenticated) */
  .ws-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(99,102,241,0.09);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 10px; padding: 6px 12px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: #a5b4fc; cursor: default;
  }

  .nav-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Sora', sans-serif; font-weight: 700;
    font-size: 12px; color: #fff; flex-shrink: 0;
  }

  /* Mobile overlay */
  .mobile-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px); z-index: 998;
  }
  .mobile-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 280px;
    background: #08080f;
    border-left: 1px solid rgba(99,102,241,0.15);
    z-index: 999; padding: 24px 20px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .mobile-nav-item {
    display: flex; align-items: center;
    padding: 12px 14px; border-radius: 11px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: #94a3b8; cursor: pointer; transition: all 0.18s;
    border: none; background: none; width: 100%; text-align: left;
  }
  .mobile-nav-item:hover { background: rgba(99,102,241,0.09); color: #f1f5f9; }
`;

const mkInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const Navbar = () => {
  const [isSticky, setIsSticky]             = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user }   = useAuth();
  const navigate                            = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
    setMobileMenuOpen(false);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Features",     id: "features"    },
    { label: "How it works", id: "how-it-works" },
    { label: "Pricing",      id: "pricing"      },
  ];

  return (
    <>
      <style>{STYLES}</style>

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          transition: "all 0.3s",
          padding: isSticky ? "12px 0" : "20px 0",
        }}
        className={isSticky ? "nav-glass" : ""}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", boxShadow: "0 0 18px rgba(99,102,241,0.35)", transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              M
            </div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", display: window.innerWidth < 480 ? "none" : "inline" }}>Meetra</span>
          </Link>

          {/* ── Desktop center nav ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
            {navItems.map(item => (
              <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Desktop right side ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden-mobile">
            {isAuthenticated ? (
              <>
                <button className="nav-btn-ghost" onClick={handleSignOut}>Sign out</button>

                <Link to="/dashboard" className="nav-btn-primary">
                  Dashboard <ChevronRight size={13} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="nav-btn-ghost">Sign in</Link>
                <Link to="/auth" className="nav-btn-primary">Get started free</Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6 }}
            className="show-mobile"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div className="mobile-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} />
            <motion.div className="mobile-drawer" initial={{ x: 280 }} animate={{ x: 0 }} exit={{ x: 280 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {/* User info (if authed) */}
              {isAuthenticated && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(99,102,241,0.07)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.15)", marginBottom: 8 }}>
                  <div className="nav-avatar">{mkInitials(user?.name || "U")}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{user?.name || "User"}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{user?.email || ""}</div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              {navItems.map(item => (
                <button key={item.id} className="mobile-nav-item" onClick={() => scrollTo(item.id)}>
                  {item.label}
                </button>
              ))}

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />

              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="mobile-nav-item" style={{ color: "#a5b4fc", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }} onClick={() => setMobileMenuOpen(false)}>
                    <Building2 size={15} /> Dashboard
                  </Link>
                  <button className="mobile-nav-item" style={{ color: "#f87171" }} onClick={handleSignOut}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="mobile-nav-item" style={{ textDecoration: "none", display: "flex" }} onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", margin: "8px 0 0", padding: "12px 14px", borderRadius: 11, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                    Get started free
                  </Link>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so page content doesn't sit behind fixed nav */}
      <div style={{ height: 80 }} />
    </>
  );
};

export default Navbar;