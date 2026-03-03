/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
  },
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#05050a",
        },
        "card-dark": "#0d0d14",
        indigo: {
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        violet: {
          500: "#a78bfa",
          600: "#8b5cf6",
          700: "#7c3aed",
        },
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
        "5xl": ["48px", { lineHeight: "56px" }],
        "6xl": ["60px", { lineHeight: "72px" }],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in",
        "slide-up": "slideUp 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.8s ease-out",
        glow: "glow 2s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.7)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(99, 102, 241, 0.3)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
        card: "0 4px 6px rgba(0, 0, 0, 0.3)",
        "card-lg": "0 10px 25px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-indigo-violet": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
