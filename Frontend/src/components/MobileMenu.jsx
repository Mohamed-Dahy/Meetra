import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  onScrollToSection,
  isAuthenticated,
  userName,
  onSignOut,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 bottom-0 w-64 bg-card-dark z-40 md:hidden flex flex-col"
          >
            <div className="flex-1 pt-20 px-6 space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onScrollToSection(item.id);
                    onClose();
                  }}
                  className="block w-full text-left text-white hover:text-indigo-500 transition-colors font-medium text-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="border-t border-gray-700 p-6 space-y-3">
              {isAuthenticated ? (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    Welcome, {userName || "User"}
                  </p>
                  <Link
                    to="/dashboard"
                    className="block w-full px-4 py-2.5 rounded-lg gradient-indigo-violet text-white font-medium text-center transition-all hover:shadow-lg"
                    onClick={onClose}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={onSignOut}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-600 text-white font-medium hover:bg-gray-900 transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block w-full px-4 py-2.5 rounded-lg border border-gray-600 text-white font-medium text-center hover:bg-gray-900 transition-all"
                    onClick={onClose}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth"
                    className="block w-full px-4 py-2.5 rounded-lg gradient-indigo-violet text-white font-medium text-center transition-all hover:shadow-lg"
                    onClick={onClose}
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
