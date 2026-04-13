import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, CheckSquare, Activity, Target, Smile, Meh, Frown, Calendar } from 'lucide-react';

const T = {
  card: '#08080f', accent: '#6366f1', accent2: '#8b5cf6',
  border: 'rgba(99,102,241,0.13)', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 } }),
};

const Bar = ({ label, value, max, color, count }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: T.text, fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Sora',sans-serif" }}>{count}</span>
    </div>
    <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.05)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '100%', borderRadius: 99, background: color }}
      />
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, sub, index }) => (
  <motion.div
    variants={fadeUp} custom={index}
    whileHover={{ y: -3, borderColor: T.borderH, boxShadow: '0 0 28px rgba(99,102,241,0.1)' }}
    style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 18, padding: 22, position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}
  >
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 110% 0%,${color}10,transparent 60%)`, pointerEvents: 'none' }} />
    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 16 }}>
      <Icon size={17} />
    </div>
    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 4, background: 'linear-gradient(135deg,#818cf8,#a78bfa,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: T.muted2, fontFamily: "'DM Sans',sans-serif", marginBottom: 3 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color, fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>{sub}</div>}
  </motion.div>
);

// Date range filter options — label shown in UI + cutoff in days (null = all time)
const RANGES = [
  { label: 'All time', days: null },
  { label: '90 days',  days: 90 },
  { label: '30 days',  days: 30 },
  { label: '7 days',   days: 7 },
];

/**
 * Filter meetings by date range.
 * Uses the meeting's `date` field. Meetings without a date are excluded when
 * a range is active so they don't inflate "all time" counts accidentally.
 */
function filterByRange(meetings, days) {
  if (!days) return meetings; // "All time" — no filter
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return meetings.filter(m => m.date && new Date(m.date) >= cutoff);
}

const AnalyticsTab = ({ meetings }) => {
  const [range, setRange] = useState(null); // null = "All time"

  // Apply the selected date filter before computing any stats
  const filtered = filterByRange(meetings, range);
  const total = filtered.length;
  const completed = filtered.filter(m => m.status === 'completed');
  const upcoming = filtered.filter(m => m.status === 'upcoming').length;
  const processing = filtered.filter(m => m.status === 'processing').length;
  const canceled = filtered.filter(m => m.status === 'canceled').length;

  const withHealth = completed.filter(m => m.healthScore > 0);
  const avgHealth = withHealth.length > 0
    ? Math.round(withHealth.reduce((s, m) => s + m.healthScore, 0) / withHealth.length)
    : 0;

  const totalActions = filtered.reduce((s, m) => s + (m.actionItems?.length || 0), 0);

  const positive = filtered.filter(m => m.sentiment === 'positive').length;
  const neutral = filtered.filter(m => m.sentiment === 'neutral').length;
  const negative = filtered.filter(m => m.sentiment === 'negative').length;

  const sentimentTotal = positive + neutral + negative;
  const pct = (n) => sentimentTotal > 0 ? Math.round((n / sentimentTotal) * 100) : 0;

  // Health score buckets: 0-39 low, 40-69 medium, 70-100 high
  const highHealth = withHealth.filter(m => m.healthScore >= 70).length;
  const medHealth = withHealth.filter(m => m.healthScore >= 40 && m.healthScore < 70).length;
  const lowHealth = withHealth.filter(m => m.healthScore < 40).length;

  const stats = [
    { icon: BarChart3, label: 'Total Meetings', value: total, color: '#6366f1', sub: 'all time', index: 0 },
    { icon: CheckSquare, label: 'Completed', value: completed.length, color: '#22c55e', sub: total > 0 ? `${Math.round((completed.length / total) * 100)}% completion rate` : '—', index: 1 },
    { icon: Target, label: 'Avg Health Score', value: avgHealth || '—', color: '#8b5cf6', sub: withHealth.length > 0 ? `from ${withHealth.length} analyzed meetings` : 'no analyzed meetings yet', index: 2 },
    { icon: Activity, label: 'Total Action Items', value: totalActions, color: '#f59e0b', sub: 'across all meetings', index: 3 },
  ];

  if (meetings.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(99,102,241,0.5)' }}>
          <BarChart3 size={28} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No data yet</div>
          <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>Create meetings and analyze them to see insights here.</div>
        </div>
      </div>
    );
  }

  // Meetings exist but none fall in the selected range
  if (total === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Analytics</h2>
            <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={12} /> 0 meetings in the last {range} days
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RANGES.map(r => {
              const active = range === r.days;
              return (
                <button key={r.label} onClick={() => setRange(r.days)} style={{ padding: '6px 14px', borderRadius: 99, fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: active ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', color: active ? '#818cf8' : T.muted2, boxShadow: active ? '0 0 0 1px rgba(99,102,241,0.5)' : '0 0 0 1px rgba(255,255,255,0.08)' }}>
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted2, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
          No meetings in this date range — try a wider window.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
      {/* Header + date range filter */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Analytics</h2>
          <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} />
            {total} meeting{total !== 1 ? 's' : ''}{range ? ` in the last ${range} days` : ' — all time'}
          </div>
        </div>

        {/* Range toggle pills — clicking a pill re-filters all stats instantly */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RANGES.map(r => {
            const active = range === r.days;
            return (
              <button
                key={r.label}
                onClick={() => setRange(r.days)}
                style={{
                  padding: '6px 14px', borderRadius: 99,
                  fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: active ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#818cf8' : T.muted2,
                  boxShadow: active ? '0 0 0 1px rgba(99,102,241,0.5)' : '0 0 0 1px rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#f1f5f9'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.muted2; } }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>

        {/* Status breakdown */}
        <motion.div variants={fadeUp} custom={4}
          style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}
        >
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} style={{ color: T.accent }} /> Meeting Status
          </div>
          <Bar label="Completed" value={completed.length} max={total} color="#4ade80" count={completed.length} />
          <Bar label="Upcoming" value={upcoming} max={total} color="#fbbf24" count={upcoming} />
          <Bar label="Processing" value={processing} max={total} color="#818cf8" count={processing} />
          <Bar label="Canceled" value={canceled} max={total} color="#f87171" count={canceled} />
        </motion.div>

        {/* Sentiment breakdown */}
        <motion.div variants={fadeUp} custom={5}
          style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}
        >
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smile size={14} style={{ color: '#4ade80' }} /> Meeting Sentiment
          </div>
          {sentimentTotal === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: T.muted, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              Analyze meetings to see sentiment data
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[
                  { icon: Smile, label: 'Positive', count: positive, pct: pct(positive), color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
                  { icon: Meh, label: 'Neutral', count: neutral, pct: pct(neutral), color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
                  { icon: Frown, label: 'Negative', count: negative, pct: pct(negative), color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 12, padding: '12px 10px', textAlign: 'center', border: `1px solid ${s.color}20` }}>
                      <Icon size={18} style={{ color: s.color, margin: '0 auto 6px' }} />
                      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: s.color }}>{s.pct}%</div>
                      <div style={{ fontSize: 10, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
              <Bar label="Positive" value={positive} max={sentimentTotal} color="#4ade80" count={positive} />
              <Bar label="Neutral" value={neutral} max={sentimentTotal} color="#fbbf24" count={neutral} />
              <Bar label="Negative" value={negative} max={sentimentTotal} color="#f87171" count={negative} />
            </>
          )}
        </motion.div>
      </div>

      {/* Health score distribution */}
      {withHealth.length > 0 && (
        <motion.div variants={fadeUp} custom={6}
          style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24 }}
        >
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={14} style={{ color: T.accent2 }} /> Health Score Distribution
            <span style={{ marginLeft: 'auto', fontSize: 12, color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontWeight: 400 }}>
              avg <span style={{ color: '#818cf8', fontWeight: 700 }}>{avgHealth}/100</span> across {withHealth.length} analyzed meetings
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'High (70–100)', count: highHealth, color: '#4ade80', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Medium (40–69)', count: medHealth, color: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
              { label: 'Low (0–39)', count: lowHealth, color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
            ].map(b => (
              <div key={b.label} style={{ background: b.bg, borderRadius: 14, padding: '16px 14px', border: `1px solid ${b.color}20` }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: b.color, marginBottom: 4 }}>{b.count}</div>
                <div style={{ fontSize: 11, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>{b.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsTab;
