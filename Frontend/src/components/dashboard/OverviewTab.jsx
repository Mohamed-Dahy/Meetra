import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, CheckSquare, Activity, Clock,
  ArrowUpRight, BarChart3, Plus, ChevronRight,
} from 'lucide-react';

const T = {
  bg: '#04040c', card: '#08080f', accent: '#6366f1', accent2: '#8b5cf6',
  border: 'rgba(99,102,241,0.13)', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

function StatusBadge({ status }) {
  const MAP = {
    completed:  { label: 'Done',       bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.2)'   },
    processing: { label: 'Processing', bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
    upcoming:   { label: 'Upcoming',   bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    canceled:   { label: 'Canceled',   bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.2)'  },
  };
  const s = MAP[status] || MAP.upcoming;
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
      variants={fadeUp} custom={index}
      whileHover={{ y: -4, borderColor: T.borderH, boxShadow: '0 0 32px rgba(99,102,241,0.1)' }}
      style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: 22, position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at 110% 0%,${stat.color}12,transparent 60%)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: `${stat.color}18`, border: `1px solid ${stat.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
          <Icon size={17} />
        </div>
        <ArrowUpRight size={13} style={{ color: T.muted, marginTop: 4 }} />
      </div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 4, background: 'linear-gradient(135deg,#818cf8,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 12, color: T.muted2, marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>{stat.label}</div>
      <div style={{ fontSize: 11, color: stat.color, fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>{stat.delta}</div>
    </motion.div>
  );
}

const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const OverviewTab = ({ meetings, loading, onNewMeeting, setActiveTab }) => {
  const completed  = meetings.filter(m => m.status === 'completed').length;
  const processing = meetings.filter(m => m.status === 'processing').length;
  const upcoming   = meetings.filter(m => m.status === 'upcoming').length;

  const stats = [
    { label: 'Total Meetings', value: meetings.length, delta: 'all time',   icon: FileText,    color: '#6366f1' },
    { label: 'Completed',      value: completed,        delta: 'completed',  icon: CheckSquare, color: '#22c55e' },
    { label: 'Processing',     value: processing,       delta: 'in progress',icon: Activity,    color: '#8b5cf6' },
    { label: 'Upcoming',       value: upcoming,         delta: 'scheduled',  icon: Clock,       color: '#f59e0b' },
  ];

  const recent = meetings.slice(0, 4);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22, height: 130, animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>

      {/* Recent meetings + Pending actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 356px', gap: 18, marginBottom: 18 }}>

        {/* Recent meetings */}
        <motion.div
          variants={fadeUp} custom={4}
          style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} style={{ color: T.accent }} /> Recent Meetings
            </div>
            <button
              onClick={() => setActiveTab('meetings')}
              style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ color: T.muted2, fontSize: 13, marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>No meetings yet</div>
              <motion.button onClick={onNewMeeting} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: 'pointer' }}
              >
                <Plus size={12} /> Create your first meeting
              </motion.button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {recent.map((m, i) => (
                <motion.div
                  key={m._id} className="m-row"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.07, duration: 0.4 }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={13} style={{ color: '#818cf8' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={10} />{getRelativeTime(m.createdAt || m.date)}
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Actions — pulled from actionItems[] on completed meetings.
            The backend stores AI-generated action items on each meeting after
            transcription. We flatten them across all meetings and show the
            most recent 6. Empty state is shown when no meetings have been
            transcribed yet. */}
        <motion.div
          variants={fadeUp} custom={5}
          style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}
        >
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CheckSquare size={14} style={{ color: '#8b5cf6' }} /> Pending Actions
          </div>
          {(() => {
            // Collect all action items from meetings that have them,
            // newest meetings first, capped at 6 items to fit the card.
            const items = meetings
              .filter(m => m.actionItems?.length > 0)
              .slice()
              .reverse()
              .flatMap(m => m.actionItems.map(text => ({ text, meeting: m.title })))
              .slice(0, 6);

            if (items.length === 0) {
              return (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '32px 20px', borderRadius: 14,
                  background: 'rgba(99,102,241,0.04)', border: '1px dashed rgba(99,102,241,0.2)',
                  textAlign: 'center',
                }}>
                  <CheckSquare size={26} style={{ color: 'rgba(139,92,246,0.35)', marginBottom: 10 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.muted2, marginBottom: 5, fontFamily: "'Sora',sans-serif" }}>No action items yet</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>Transcribe a meeting to get AI-generated action items</div>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '9px 12px', borderRadius: 10,
                      background: 'rgba(139,92,246,0.06)',
                      border: '1px solid rgba(139,92,246,0.12)',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: '1.5px solid rgba(139,92,246,0.4)',
                      background: 'rgba(139,92,246,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{item.text}</div>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.meeting}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </motion.div>
      </div>

      {/* Banner */}
      <motion.div
        variants={fadeUp} custom={6}
        style={{ borderRadius: 20, padding: '26px 28px', background: T.card, border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 24 }}
      >
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ width: 60, height: 60, borderRadius: 17, flexShrink: 0, background: 'rgba(99,102,241,0.11)', border: '1px solid rgba(99,102,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}
        >
          <BarChart3 size={26} />
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 5 }}>Your workspace is ready</div>
          <div style={{ fontSize: 13, color: T.muted2, lineHeight: 1.6 }}>Upload a meeting recording or create a new meeting to get AI-powered insights and action items.</div>
        </div>
        <motion.button
          onClick={onNewMeeting}
          whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(99,102,241,0.5)' }}
          whileTap={{ scale: 0.97 }}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 11, padding: '11px 22px', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
        >
          <Plus size={14} /> New Meeting
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OverviewTab;
