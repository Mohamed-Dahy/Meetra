import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Video, Users, MessageCircle,
  LogOut, Settings, ChevronRight, Zap,
} from 'lucide-react';

/* ─── inline styles so the sidebar carries its own look
       without relying on Tailwind classes that might be missing ─── */
const S = {
  root: {
    width: 240,
    minWidth: 240,
    height: '100vh',
    background: 'linear-gradient(180deg,#06060f 0%,#08081a 100%)',
    borderRight: '1px solid rgba(99,102,241,0.1)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  /* subtle radial glow behind logo */
  glow: {
    position: 'absolute', top: -60, left: -60,
    width: 240, height: 240,
    background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)',
    pointerEvents: 'none',
  },
  /* faint grid texture overlay */
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),
      linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)
    `,
    backgroundSize: '28px 28px',
    pointerEvents: 'none',
  },
  header: {
    padding: '22px 20px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 10,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff',
    boxShadow: '0 0 18px rgba(99,102,241,0.45)',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Sora',sans-serif", fontWeight: 700,
    fontSize: 17, color: '#fff', letterSpacing: '-0.02em',
  },
  nav: {
    flex: 1, padding: '14px 12px',
    display: 'flex', flexDirection: 'column', gap: 3,
    position: 'relative', zIndex: 1,
    overflowY: 'auto',
  },
  navLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    color: 'rgba(148,163,184,0.4)', fontFamily: "'Sora',sans-serif",
    textTransform: 'uppercase', padding: '10px 10px 4px',
  },
  footer: {
    padding: '12px 12px 16px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 12,
    background: 'rgba(99,102,241,0.07)',
    border: '1px solid rgba(99,102,241,0.12)',
    marginBottom: 6,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 9,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: '#fff',
    flexShrink: 0,
  },
};

/* ─── nav item config ─── */
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard'  },
  { id: 'meetings',   label: 'Meetings',   icon: Video,            path: '/meetings'   },
  { id: 'workspaces', label: 'Workspaces', icon: Users,            path: '/workspaces' },
  { id: 'messages',   label: 'Messages',   icon: MessageCircle,    path: '/messages'   },
];

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        width: '100%', padding: '9px 12px', borderRadius: 10,
        border: `1px solid ${isActive ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
        background: isActive ? 'rgba(99,102,241,0.13)' : 'none',
        color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.8)',
        fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
        cursor: 'pointer', textAlign: 'left', position: 'relative',
        transition: 'color 0.2s, background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
          e.currentTarget.style.color = '#e2e8f0';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = 'rgba(148,163,184,0.8)';
        }
      }}
    >
      {/* active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="activeBar"
          style={{
            position: 'absolute', left: 0, top: '20%', bottom: '20%',
            width: 3, borderRadius: 99,
            background: 'linear-gradient(180deg,#6366f1,#8b5cf6)',
            boxShadow: '0 0 8px rgba(99,102,241,0.8)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
        color: isActive ? '#818cf8' : 'inherit',
        transition: 'all 0.2s',
      }}>
        <Icon size={14} />
      </div>
      <span style={{ flex: 1 }}>{item.label}</span>
      {isActive && (
        <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
      )}
    </motion.button>
  );
}

/* ─── footer action button ─── */
function FooterBtn({ icon: Icon, label, onClick, danger }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 12px', borderRadius: 9,
        border: '1px solid transparent', background: 'none',
        color: danger ? 'rgba(248,113,113,0.75)' : 'rgba(148,163,184,0.65)',
        fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger
          ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.07)';
        e.currentTarget.style.color = danger ? '#f87171' : '#e2e8f0';
        e.currentTarget.style.borderColor = danger
          ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.color = danger
          ? 'rgba(248,113,113,0.75)' : 'rgba(148,163,184,0.65)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
      }}>
        <Icon size={13} />
      </div>
      {label}
    </motion.button>
  );
}

/* ══════════ SIDEBAR COMPONENT ══════════ */
const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const activeId = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.id || 'dashboard';
  const userInitials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => { logout(); navigate('/auth'); };

  /* staggered entrance */
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -14 },
    show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      style={S.root}
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* bg decorations */}
      <div style={S.glow} />
      <div style={S.grid} />

      {/* ── Logo ── */}
      <motion.div
        style={S.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y:   0  }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <motion.div
          style={S.logoMark}
          whileHover={{ scale: 1.08, boxShadow: '0 0 28px rgba(99,102,241,0.65)' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          M
        </motion.div>
        <span style={S.logoText}>Meetra</span>
        {/* live status dot */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ position: 'relative', width: 7, height: 7 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: 0.4, animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
          </div>
        </div>
      </motion.div>

      {/* ── Nav ── */}
      <motion.nav
        style={S.nav}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <div style={S.navLabel}>Menu</div>
        </motion.div>

        {NAV_ITEMS.map(item => (
          <motion.div key={item.id} variants={itemVariants}>
            <NavItem
              item={item}
              isActive={activeId === item.id}
              onClick={() => navigate(item.path)}
            />
          </motion.div>
        ))}

        {/* upgrade nudge */}
        <motion.div
          variants={itemVariants}
          style={{ marginTop: 'auto', paddingTop: 16 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '14px 14px',
              borderRadius: 14,
              background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))',
              border: '1px solid rgba(99,102,241,0.2)',
              cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* shimmer */}
            <div style={{
              position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
              background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)',
              animation: 'shimmer 3s ease-in-out infinite',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Zap size={13} style={{ color: '#fbbf24' }} />
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, color: '#fff' }}>Upgrade Plan</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)', lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>
              Unlock AI transcription, analytics & more
            </div>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* ── Footer ── */}
      <motion.div
        style={S.footer}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {/* user card */}
        <div style={S.userCard}>
          <div style={S.userAvatar}>{userInitials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'DM Sans',sans-serif" }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'member'}
            </div>
          </div>
        </div>

        <FooterBtn icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
        <FooterBtn icon={LogOut}   label="Sign out"  onClick={handleLogout} danger />
      </motion.div>

      {/* keyframe injector */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes ping { 75%,100% { transform:scale(2.2); opacity:0; } }
        @keyframes shimmer { 0%{left:-100%} 60%,100%{left:160%} }
      `}</style>
    </motion.div>
  );
};

export default Sidebar;