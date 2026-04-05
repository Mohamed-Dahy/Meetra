import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, MapPin, Pencil, Trash2, Plus, Search, Calendar } from 'lucide-react';

const T = {
  card: '#08080f', border: 'rgba(99,102,241,0.13)', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
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
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: "'Sora',sans-serif", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

const formatDate = (date, time) => {
  if (!date) return 'No date';
  try {
    const d = new Date(date);
    const ds = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return time ? `${ds} · ${time}` : ds;
  } catch {
    return String(date);
  }
};

const SkeletonRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: '1px solid transparent', background: 'rgba(255,255,255,0.014)', marginBottom: 6 }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: 13, width: '45%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
      <div style={{ height: 11, width: '25%', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }} />
    </div>
    <div style={{ height: 22, width: 70, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }} />
  </div>
);

const MeetingsTab = ({ meetings, loading, error, onNew, onEdit, onDelete }) => {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = meetings.filter(m =>
    !query ||
    m.title?.toLowerCase().includes(query.toLowerCase()) ||
    m.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Meetings</h2>
          <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>
            {loading ? 'Loading…' : `${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <motion.button onClick={onNew} whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 16px rgba(99,102,241,0.25)' }}
        >
          <Plus size={14} /> New Meeting
        </motion.button>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16,
        background: searchFocused ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${searchFocused ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 11, padding: '9px 14px', maxWidth: 340, transition: 'all 0.25s',
      }}>
        <Search size={13} style={{ color: T.muted2, flexShrink: 0 }} />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
          placeholder="Search meetings…"
          style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, flex: 1 }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
          {error}
        </div>
      )}

      {/* List */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16 }}>
        {loading ? (
          [0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Calendar size={32} style={{ color: 'rgba(99,102,241,0.3)', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: T.muted2, marginBottom: 8, fontFamily: "'Sora',sans-serif" }}>
              {query ? 'No matching meetings' : 'No meetings yet'}
            </div>
            {!query && (
              <motion.button onClick={onNew} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer', marginTop: 4 }}
              >
                <Plus size={13} /> Create your first meeting
              </motion.button>
            )}
          </div>
        ) : filtered.map((m, i) => (
          <motion.div
            key={m._id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className="m-row"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, border: '1px solid transparent', background: 'rgba(255,255,255,0.014)', transition: 'all 0.2s', cursor: 'default', marginBottom: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.014)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={14} style={{ color: '#818cf8' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                {m.title}
              </div>
              <div style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {(m.date || m.time) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {formatDate(m.date, m.time)}
                  </span>
                )}
                {m.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={10} /> {m.location}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={m.status} />
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <motion.button onClick={() => onEdit(m)} whileTap={{ scale: 0.9 }}
                title="Edit"
                style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.07)', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
              >
                <Pencil size={12} />
              </motion.button>
              <motion.button onClick={() => onDelete(m)} whileTap={{ scale: 0.9 }}
                title="Delete"
                style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.07)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
              >
                <Trash2 size={12} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MeetingsTab;
