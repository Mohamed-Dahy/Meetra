// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bell, Search, Plus, Zap, BarChart3,
  TrendingUp, Clock, FileText, ArrowUpRight,
  CheckSquare, Users, ChevronRight, Activity,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

/* ─────────────────── design tokens ─────────────────── */
const T = {
  bg:      '#04040c',
  card:    '#08080f',
  accent:  '#6366f1',
  accent2: '#8b5cf6',
  border:  'rgba(99,102,241,0.13)',
  borderH: 'rgba(99,102,241,0.45)',
  text:    '#f1f5f9',
  muted:   '#475569',
  muted2:  '#94a3b8',
};

/* ─────────────────── motion variants ─────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ─────────────────── demo data ─────────────────── */
const STATS = [
  { label: 'Meetings',     value: '24',   delta: '+3 this week',  icon: FileText,    color: '#6366f1' },
  { label: 'Action Items', value: '9',    delta: '4 completed',   icon: CheckSquare, color: '#8b5cf6' },
  { label: 'Members',      value: '12',   delta: '+1 joined',     icon: Users,       color: '#06b6d4' },
  { label: 'Growth',       value: '+18%', delta: 'vs last month', icon: TrendingUp,  color: '#22c55e' },
];

const RECENT = [
  { title: 'Q2 Planning Session',   time: '2 hours ago', status: 'completed'  },
  { title: 'Design Review v3',      time: 'Yesterday',   status: 'processing' },
  { title: 'Investor Sync',         time: '3 days ago',  status: 'completed'  },
  { title: 'Sprint Retrospective',  time: '5 days ago',  status: 'pending'    },
];

const TASKS = [
  { task: 'Prepare Q3 budget report',   owner: 'Sarah', done: false },
  { task: 'Schedule follow-up meeting', owner: 'John',  done: true  },
  { task: 'Review marketing proposals', owner: 'Ahmed', done: false },
  { task: 'Update product roadmap doc', owner: 'Layla', done: false },
];

/* ─────────────────── small helpers ─────────────────── */
function StatusBadge({ status }) {
  const MAP = {
    completed:  { label: 'Done',       bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.2)'   },
    processing: { label: 'Processing', bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
    pending:    { label: 'Pending',    bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  };
  const s = MAP[status] || MAP.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 99, fontSize: 11, fontWeight: 700,
      fontFamily: "'Sora',sans-serif",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  );
}

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -4, borderColor: T.borderH, boxShadow: '0 0 32px rgba(99,102,241,0.1)' }}
      style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: 22, position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at 110% 0%,${stat.color}12,transparent 60%)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `${stat.color}18`, border: `1px solid ${stat.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color,
        }}>
          <Icon size={17} />
        </div>
        <ArrowUpRight size={13} style={{ color: T.muted, marginTop: 4 }} />
      </div>
      <div style={{
        fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800,
        marginBottom: 4,
        background: 'linear-gradient(135deg,#818cf8,#a78bfa,#67e8f9)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 12, color: T.muted2, marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>{stat.label}</div>
      <div style={{ fontSize: 11, color: stat.color, fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>{stat.delta}</div>
    </motion.div>
  );
}

/* ══════════════ DASHBOARD ══════════════ */
const Dashboard = () => {
  const [search, setSearch]           = useState('');
  const [searchFocused, setFocused]   = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#04040c; }
        ::-webkit-scrollbar-thumb { background:#6366f1; border-radius:99px; }

        .d-noise::after {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:9999;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity:.02;
        }
        .d-grid {
          background-image:
            linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px);
          background-size:56px 56px;
        }
        .m-row {
          display:flex; align-items:center; gap:14px;
          padding:12px 16px; border-radius:12px;
          border:1px solid transparent;
          background:rgba(255,255,255,0.014);
          transition:all 0.2s; cursor:pointer;
        }
        .m-row:hover { background:rgba(99,102,241,0.06); border-color:rgba(99,102,241,0.2); }
      `}</style>

      <div
        className="d-noise"
        style={{ display:'flex', height:'100vh', overflow:'hidden', background:T.bg, fontFamily:"'DM Sans',sans-serif" }}
      >
        <Sidebar />

        {/* ── right panel ── */}
        <div className="d-grid" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* TOPBAR */}
          <motion.header
            initial={{ opacity:0, y:-16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{
              height:60, flexShrink:0,
              background:'rgba(4,4,12,0.88)', backdropFilter:'blur(20px)',
              borderBottom:'1px solid rgba(99,102,241,0.08)',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'0 28px', gap:16,
            }}
          >
            {/* search */}
            <div style={{
              display:'flex', alignItems:'center', gap:9, width:260,
              background: searchFocused ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${searchFocused ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius:11, padding:'8px 14px', transition:'all 0.25s',
            }}>
              <Search size={14} style={{ color:T.muted2, flexShrink:0 }}/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search meetings, tasks…"
                style={{
                  background:'none', border:'none', outline:'none',
                  color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, flex:1,
                }}
              />
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {/* bell */}
              <motion.button
                whileTap={{ scale:0.9 }}
                style={{
                  width:36, height:36, borderRadius:10, cursor:'pointer',
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:T.muted2, position:'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.1)'; e.currentTarget.style.color='#e2e8f0'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color=T.muted2; }}
              >
                <Bell size={15}/>
                <span style={{ position:'absolute', top:7, right:7, width:6, height:6, borderRadius:'50%', background:'#6366f1', boxShadow:'0 0 6px rgba(99,102,241,0.8)' }}/>
              </motion.button>

              {/* CTA */}
              <motion.button
                whileHover={{ scale:1.03, boxShadow:'0 0 30px rgba(99,102,241,0.45)' }}
                whileTap={{ scale:0.97 }}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color:'#fff', border:'none', borderRadius:10,
                  padding:'8px 16px', fontFamily:"'Sora',sans-serif",
                  fontSize:13, fontWeight:600, cursor:'pointer',
                  boxShadow:'0 0 20px rgba(99,102,241,0.3)',
                }}
              >
                <Plus size={14}/> New Meeting
              </motion.button>
            </div>
          </motion.header>

          {/* CONTENT */}
          <div style={{ flex:1, overflowY:'auto', padding:'28px 28px 48px' }}>
            <motion.div variants={stagger} initial="hidden" animate="visible">

              {/* Welcome */}
              <motion.div variants={fadeUp} custom={0} style={{ marginBottom:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
                  <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>
                    Welcome back
                  </h1>
                  <motion.div
                    animate={{ rotate:[0,14,-8,14,0], scale:[1,1.2,1,1.1,1] }}
                    transition={{ repeat:Infinity, duration:4, repeatDelay:3 }}
                  >
                    <Sparkles size={22} style={{ color:'#fbbf24' }}/>
                  </motion.div>
                </div>
                <p style={{ fontSize:14, color:T.muted2 }}>Here's what's happening in your workspace today.</p>
              </motion.div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
                {STATS.map((s,i) => <StatCard key={s.label} stat={s} index={i}/>)}
              </div>

              {/* Meetings + Tasks */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 356px', gap:18, marginBottom:18 }}>

                {/* Recent meetings */}
                <motion.div
                  variants={fadeUp} custom={4}
                  style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:24 }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>
                      <Activity size={14} style={{ color:T.accent }}/> Recent Meetings
                    </div>
                    <button style={{ fontSize:12, color:'#818cf8', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
                      View all <ChevronRight size={12}/>
                    </button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {RECENT.map((m,i) => (
                      <motion.div
                        key={i} className="m-row"
                        initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay:0.28+i*0.07, duration:0.4 }}
                      >
                        <div style={{ width:34, height:34, borderRadius:10, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <FileText size={13} style={{ color:'#818cf8' }}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>{m.title}</div>
                          <div style={{ fontSize:11, color:T.muted, display:'flex', alignItems:'center', gap:5 }}>
                            <Clock size={10}/>{m.time}
                          </div>
                        </div>
                        <StatusBadge status={m.status}/>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Action items */}
                <motion.div
                  variants={fadeUp} custom={5}
                  style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:24 }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>
                      <CheckSquare size={14} style={{ color:'#8b5cf6' }}/> Action Items
                    </div>
                    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, background:'rgba(99,102,241,0.12)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)', fontFamily:"'Sora',sans-serif" }}>
                      {TASKS.filter(t=>!t.done).length} open
                    </span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    {TASKS.map((t,i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        transition={{ delay:0.32+i*0.07 }}
                        style={{
                          display:'flex', alignItems:'flex-start', gap:11,
                          padding:'11px 0',
                          borderBottom: i<TASKS.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}
                      >
                        <motion.div
                          whileTap={{ scale:0.82 }}
                          style={{
                            width:18, height:18, borderRadius:5, flexShrink:0, marginTop:1,
                            border:`2px solid ${t.done ? '#6366f1' : 'rgba(99,102,241,0.35)'}`,
                            background: t.done ? '#6366f1' : 'transparent',
                            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                          }}
                        >
                          {t.done && (
                            <svg width="9" height="7" viewBox="0 0 10 8">
                              <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                            </svg>
                          )}
                        </motion.div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:t.done ? T.muted : T.text, textDecoration:t.done ? 'line-through' : 'none', marginBottom:2 }}>{t.task}</div>
                          <div style={{ fontSize:10, color:T.muted }}>@{t.owner}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Banner */}
              <motion.div
                variants={fadeUp} custom={6}
                style={{
                  borderRadius:20, padding:'26px 28px',
                  background:T.card, border:`1px solid ${T.border}`,
                  position:'relative', overflow:'hidden',
                  display:'flex', alignItems:'center', gap:24,
                }}
              >
                <div style={{ position:'absolute', right:-60, top:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 70%)', pointerEvents:'none' }}/>
                <motion.div
                  animate={{ y:[0,-6,0] }}
                  transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }}
                  style={{ width:60, height:60, borderRadius:17, flexShrink:0, background:'rgba(99,102,241,0.11)', border:'1px solid rgba(99,102,241,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}
                >
                  <BarChart3 size={26}/>
                </motion.div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:700, color:'#fff', marginBottom:5 }}>Your workspace is ready</div>
                  <div style={{ fontSize:13, color:T.muted2, lineHeight:1.6 }}>Upload a meeting recording or create a new meeting to get AI-powered insights and action items.</div>
                </div>
                <motion.button
                  whileHover={{ scale:1.04, boxShadow:'0 0 28px rgba(99,102,241,0.5)' }}
                  whileTap={{ scale:0.97 }}
                  style={{ flexShrink:0, display:'flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:11, padding:'11px 22px', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 0 20px rgba(99,102,241,0.3)' }}
                >
                  <Plus size={14}/> Get started
                </motion.button>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;