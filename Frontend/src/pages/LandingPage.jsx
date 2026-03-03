import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle, TrendingUp, FileText, ArrowRight, Check, Menu, X } from "lucide-react";

/* ─── CSS-in-JS global styles ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

  :root {
    --bg:        #04040c;
    --bg-card:   #08080f;
    --bg-card2:  #0c0c18;
    --accent:    #6366f1;
    --accent2:   #8b5cf6;
    --accent3:   #06b6d4;
    --border:    rgba(99,102,241,0.18);
    --border-hi: rgba(99,102,241,0.55);
    --text:      #f1f5f9;
    --muted:     #64748b;
    --muted2:    #94a3b8;
    --sora:      'Sora', sans-serif;
    --dm:        'DM Sans', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--dm);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }

  /* ── Noise texture overlay ── */
  .noise::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.025;
    pointer-events: none;
    z-index: 9999;
  }

  /* ── Grid bg ── */
  .grid-bg {
    background-image:
      linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* ── Glow orbs ── */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
  }
  .orb-1 { width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,0.22),transparent 70%);top:-200px;left:-150px; }
  .orb-2 { width:500px;height:500px;background:radial-gradient(circle,rgba(139,92,246,0.18),transparent 70%);top:100px;right:-100px; }
  .orb-3 { width:400px;height:400px;background:radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%);bottom:-100px;left:30%; }

  /* ── Gradient text ── */
  .gt {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #67e8f9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Shimmer border card ── */
  .shimmer-card {
    position: relative;
    background: var(--bg-card);
    border-radius: 16px;
    overflow: hidden;
  }
  .shimmer-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.1), rgba(99,102,241,0.4));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  /* ── Glow button ── */
  .btn-glow {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 28px;
    font-family: var(--sora);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 30px rgba(99,102,241,0.35), 0 4px 20px rgba(0,0,0,0.4);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent, rgba(255,255,255,0.12), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(99,102,241,0.6), 0 8px 30px rgba(0,0,0,0.5); }
  .btn-glow:hover::after { transform: translateX(100%); }

  .btn-ghost {
    background: transparent;
    color: var(--muted2);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 28px;
    font-family: var(--sora);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-ghost:hover { border-color: var(--border-hi); color: var(--text); background: rgba(99,102,241,0.06); }

  /* ── Feature card ── */
  .feat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 24px;
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    position: relative;
    overflow: hidden;
  }
  .feat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .feat-card:hover { border-color: var(--border-hi); box-shadow: 0 0 40px rgba(99,102,241,0.12); transform: translateY(-6px); }
  .feat-card:hover::before { opacity: 1; }

  /* ── Step connector ── */
  .step-connector {
    position: absolute;
    top: 32px;
    left: calc(50% + 40px);
    right: calc(-50% + 40px);
    height: 1px;
    background: linear-gradient(90deg, rgba(99,102,241,0.5), rgba(139,92,246,0.2));
  }

  /* ── Stat card ── */
  .stat-card {
    text-align: center;
    padding: 40px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
  }
  .stat-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
  }

  /* ── Pricing card ── */
  .price-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 32px;
    position: relative;
    transition: all 0.3s;
  }
  .price-card.popular {
    border-color: rgba(99,102,241,0.5);
    background: linear-gradient(160deg, rgba(99,102,241,0.08), var(--bg-card) 60%);
    box-shadow: 0 0 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(99,102,241,0.2);
  }
  .price-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.1); }

  /* ── Navbar ── */
  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    transition: all 0.3s;
  }
  .navbar.scrolled {
    background: rgba(4,4,12,0.85);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(99,102,241,0.1);
  }

  /* ── Mock dashboard ── */
  .mock-dashboard {
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08);
    position: relative;
  }
  .mock-dashboard::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(99,102,241,0.3), transparent 40%, rgba(139,92,246,0.2));
    z-index: -1;
  }
  .mock-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 16px;
  }

  /* ── Section label ── */
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 99px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #818cf8;
    margin-bottom: 20px;
  }

  /* ── Pulse dot ── */
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  .pulse-dot {
    position: relative;
    display: inline-flex;
  }
  .pulse-dot::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #22c55e;
    animation: pulse-ring 1.5s ease-out infinite;
  }

  /* ── Hero float ── */
  @keyframes heroFloat {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(0.5deg); }
  }
  .hero-float { animation: heroFloat 7s ease-in-out infinite; }

  /* ── Typing cursor ── */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .cursor { display:inline-block; width:2px; height:1em; background:var(--accent); margin-left:2px; animation: blink 1s step-end infinite; vertical-align:text-bottom; }

  /* ── Footer ── */
  .footer-grad {
    background: linear-gradient(0deg, rgba(99,102,241,0.04), transparent);
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

/* ─── Framer variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 } }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Section({ children, id, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

/* ─── Main Component ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Progress bar */}
      <motion.div
        style={{ width: progressWidth, position: "fixed", top: 0, left: 0, height: "2px",
          background: "linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)", zIndex: 200, transformOrigin: "left" }}
      />

      <div className="noise" style={{ background: "var(--bg)", minHeight: "100vh" }}>

        {/* ══════════ NAVBAR ══════════ */}
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sora)", fontWeight: 700, fontSize: 16, color: "#fff", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>M</div>
              <span style={{ fontFamily: "var(--sora)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Meetra</span>
            </Link>

            {/* Desktop nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-nav">
              {["features", "how-it-works", "pricing"].map((id) => (
                <button key={id} onClick={() => scrollTo(id)}
                  style={{ background: "none", border: "none", color: "var(--muted2)", fontFamily: "var(--dm)", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 14px", borderRadius: 8, transition: "color 0.2s", textTransform: "capitalize" }}
                  onMouseEnter={e => e.target.style.color = "#fff"}
                  onMouseLeave={e => e.target.style.color = "var(--muted2)"}
                >
                  {id.replace("-", " ")}
                </button>
              ))}
              <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 8px" }} />
              <Link to="/auth" className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>Sign in</Link>
              <Link to="/auth" className="btn-glow" style={{ padding: "8px 18px", fontSize: 13 }}>Get started free</Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer" }}
              className="mobile-menu-btn">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ background: "rgba(4,4,12,0.97)", borderBottom: "1px solid rgba(99,102,241,0.1)", padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {["features", "how-it-works", "pricing"].map((id) => (
                  <button key={id} onClick={() => scrollTo(id)}
                    style={{ background: "none", border: "none", color: "var(--muted2)", textAlign: "left", padding: "10px 0", fontSize: 15, cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--dm)" }}>
                    {id.replace("-", " ")}
                  </button>
                ))}
                <Link to="/auth" className="btn-glow" style={{ marginTop: 8, justifyContent: "center" }}>Get started free</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section style={{ position: "relative", paddingTop: 160, paddingBottom: 100, overflow: "hidden", minHeight: "100vh", display: "flex", alignItems: "center" }} className="grid-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%" }}>
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ textAlign: "center" }}>

              <motion.div variants={fadeUp} custom={0}>
                <div className="section-label">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                  AI Meeting Intelligence
                </div>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                style={{ fontFamily: "var(--sora)", fontSize: "clamp(42px,6vw,82px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#fff", marginBottom: 24 }}>
                Every meeting,{" "}<br />
                <span className="gt">perfectly captured.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                style={{ fontSize: "clamp(16px,2vw,20px)", color: "var(--muted2)", maxWidth: 580, margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 400 }}>
                Meetra listens, understands, and transforms your meetings into
                structured insights your team can actually act on.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 80 }}>
                <Link to="/auth" className="btn-glow" style={{ fontSize: 15, padding: "14px 32px" }}>
                  Start for free <ArrowRight size={16} />
                </Link>
                <button onClick={() => scrollTo("how-it-works")} className="btn-ghost" style={{ fontSize: 15, padding: "14px 32px" }}>
                  See how it works
                </button>
              </motion.div>

              {/* Dashboard mockup */}
              <motion.div variants={fadeUp} custom={4} className="hero-float" style={{ maxWidth: 780, margin: "0 auto" }}>
                <div className="mock-dashboard">
                  {/* Top bar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="pulse-dot">
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", position: "relative", zIndex: 1 }} />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--muted2)" }}>Q3 Budget Review — analyzed just now</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["#ef4444","#f59e0b","#22c55e"].map((c,i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.6 }} />
                      ))}
                    </div>
                  </div>

                  {/* Cards row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
                    <div className="mock-card">
                      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
                      <p style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>Q3 review discussing performance metrics and Q2 planning. 6 action items found.</p>
                    </div>
                    <div className="mock-card">
                      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Action Items</div>
                      {["Prepare budget report — Sarah","Schedule follow-up — John","Review proposals — Ahmed"].map((t,i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                          <Check size={10} style={{ color: "#818cf8", marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "var(--muted2)" }}>{t}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mock-card">
                      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Health Score</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--sora)", fontSize: 42, fontWeight: 800, lineHeight: 1 }} className="gt">94</span>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>/100</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                          style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
                      </div>
                      <p style={{ fontSize: 11, color: "#22c55e", marginTop: 6 }}>Excellent meeting</p>
                    </div>
                  </div>

                  {/* Export button */}
                  <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "var(--muted2)" }}>📄 meetra-report-q3.pdf ready</span>
                    <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: "var(--sora)", cursor: "pointer" }}>
                      Download
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <Section id="features" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto", display: "block" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label">Features</div>
            <h2 style={{ fontFamily: "var(--sora)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
              Everything your team needs
            </h2>
            <p style={{ color: "var(--muted2)", fontSize: 18, maxWidth: 480, margin: "0 auto" }}>
              Comprehensive tools that turn chaotic meetings into clarity
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {[
              { icon: <Zap size={28} />, title: "Smart Summaries", desc: "AI-generated concise summaries in seconds. Never take notes again.", color: "#6366f1" },
              { icon: <CheckCircle size={28} />, title: "Action Items", desc: "Tasks automatically extracted and assigned to the right people.", color: "#8b5cf6" },
              { icon: <TrendingUp size={28} />, title: "Health Score", desc: "Know exactly how productive and well-structured each meeting was.", color: "#06b6d4" },
              { icon: <FileText size={28} />, title: "PDF Reports", desc: "Beautiful branded exports ready to share with your entire team.", color: "#f59e0b" },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="feat-card"
                whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "var(--sora)", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <Section id="how-it-works" style={{ padding: "120px 24px", maxWidth: 1000, margin: "0 auto", display: "block" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 80 }}>
            <div className="section-label">Process</div>
            <h2 style={{ fontFamily: "var(--sora)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
              Simple as 1, 2, 3
            </h2>
            <p style={{ color: "var(--muted2)", fontSize: 18 }}>Get started with Meetra in under a minute</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40, position: "relative" }}>
            {/* connector lines */}
            <div style={{ position: "absolute", top: 40, left: "calc(33% + 20px)", right: "calc(33% + 20px)", height: 1, background: "linear-gradient(90deg,rgba(99,102,241,0.5),rgba(139,92,246,0.5))" }} />

            {[
              { n: "01", title: "Upload your meeting", desc: "Drop in an audio file or paste your transcript. We support all common formats up to 25MB." },
              { n: "02", title: "AI extracts insights", desc: "Our AI reads the transcript and pulls out summary, action items, decisions, and sentiment." },
              { n: "03", title: "Share your report", desc: "Download a polished PDF report and share it with your entire team in one click." },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                  <motion.div whileHover={{ scale: 1.1, rotate: 3 }} transition={{ type: "spring", stiffness: 300 }}
                    style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                    <span style={{ fontFamily: "var(--sora)", fontSize: 24, fontWeight: 800 }} className="gt">{s.n}</span>
                  </motion.div>
                </div>
                <h3 style={{ fontFamily: "var(--sora)", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════ STATS ══════════ */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { n: "10x", l: "Faster than manual notes" },
              { n: "95%", l: "Accuracy in transcription" },
              { n: "500+", l: "Teams already using Meetra" },
            ].map((s, i) => (
              <motion.div key={i} className="stat-card"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22,1,0.36,1] }}
                viewport={{ once: true }}>
                <div style={{ fontFamily: "var(--sora)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, marginBottom: 8 }} className="gt">{s.n}</div>
                <p style={{ color: "var(--muted2)", fontSize: 15 }}>{s.l}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════ PRICING ══════════ */}
        <Section id="pricing" style={{ padding: "120px 24px", maxWidth: 1100, margin: "0 auto", display: "block" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label">Pricing</div>
            <h2 style={{ fontFamily: "var(--sora)", fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: "var(--muted2)", fontSize: 18 }}>Choose the perfect plan for your team</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, alignItems: "start" }}>
            {[
              { name: "Starter", price: "Free", desc: "Perfect for trying Meetra", features: ["5 meetings/month","Basic summary","PDF export","Email support"], popular: false },
              { name: "Pro", price: "$29", period: "/mo", desc: "For growing teams", features: ["Unlimited meetings","Smart summaries","Action items","Health score","PDF reports","Priority support","Team collaboration"], popular: true },
              { name: "Enterprise", price: "Custom", desc: "For large organizations", features: ["Everything in Pro","Custom integrations","Dedicated support","SLA guarantee","Advanced analytics","On-premise option"], popular: false },
            ].map((p, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className={`price-card ${p.popular ? "popular" : ""}`}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                style={{ marginTop: p.popular ? -16 : 0 }}>
                {p.popular && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderRadius: 99, padding: "4px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--sora)", whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontFamily: "var(--sora)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>{p.desc}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 28 }}>
                  <span style={{ fontFamily: "var(--sora)", fontSize: 44, fontWeight: 800, color: "#fff" }}>{p.price}</span>
                  {p.period && <span style={{ color: "var(--muted)", fontSize: 16 }}>{p.period}</span>}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />
                <ul style={{ listStyle: "none", marginBottom: 32 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <Check size={10} style={{ color: "#818cf8" }} />
                      </div>
                      <span style={{ fontSize: 14, color: "var(--muted2)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className={p.popular ? "btn-glow" : "btn-ghost"}
                  style={{ width: "100%", justifyContent: "center", textAlign: "center", display: "flex" }}>
                  Get started
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════ CTA BANNER ══════════ */}
        <section style={{ padding: "80px 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }} viewport={{ once: true }}
            style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "64px 40px", background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)", pointerEvents: "none" }} />
            <h2 style={{ fontFamily: "var(--sora)", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: "#fff", marginBottom: 16, position: "relative" }}>
              Ready to transform your meetings?
            </h2>
            <p style={{ color: "var(--muted2)", fontSize: 18, marginBottom: 36, position: "relative" }}>
              Join 500+ teams already using Meetra to make every meeting count.
            </p>
            <Link to="/auth" className="btn-glow" style={{ fontSize: 16, padding: "16px 40px", position: "relative" }}>
              Start for free today <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="footer-grad" style={{ padding: "60px 24px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
              <div>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sora)", fontWeight: 700, color: "#fff", fontSize: 16 }}>M</div>
                  <span style={{ fontFamily: "var(--sora)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Meetra</span>
                </Link>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>Turn every meeting into clarity.<br />AI-powered meeting intelligence for teams.</p>
              </div>

              {[
                { title: "Product", links: ["Features","Pricing","How it works"] },
                { title: "Company", links: ["About","Blog","Careers"] },
                { title: "Legal", links: ["Privacy","Terms","Security"] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 style={{ fontFamily: "var(--sora)", fontWeight: 600, color: "#fff", marginBottom: 16, fontSize: 14 }}>{col.title}</h4>
                  <ul style={{ listStyle: "none" }}>
                    {col.links.map((l, j) => (
                      <li key={j} style={{ marginBottom: 10 }}>
                        <a href="#" style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                          onMouseEnter={e => e.target.style.color = "#fff"}
                          onMouseLeave={e => e.target.style.color = "var(--muted)"}>{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, textAlign: "center" }}>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>© 2026 Meetra. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}