import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "How it works", id: "how-it-works" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSticky
            ? "glass py-3 shadow-lg"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-white font-sora text-xl font-bold group"
            >
              <div className="w-10 h-10 rounded-lg gradient-indigo-violet flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="hidden sm:inline">Meetra</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-300">
                    {user?.name || "User"}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg btn-ghost text-sm font-medium"
                  >
                    Sign out
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-lg btn-primary text-sm font-medium text-white"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-4 py-2 rounded-lg btn-ghost text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className="px-4 py-2 rounded-lg btn-primary text-sm font-medium text-white"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        onScrollToSection={scrollToSection}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        onSignOut={handleSignOut}
      />

      {/* Spacer */}
      <div className="h-20 md:h-24" />
    </>
  );
};

export default Navbar;
