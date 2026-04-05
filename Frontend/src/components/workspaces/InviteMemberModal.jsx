import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Search } from 'lucide-react';

const T = {
  card: '#08080f', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const InviteMemberModal = ({ workspace, connections, onClose, onInvite }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // members already in workspace (by userId._id or userId string)
  const memberIds = new Set(
    (workspace?.members || []).map(m => m.userId?._id || m.userId)
  );

  const eligible = (connections || []).filter(c => {
    if (memberIds.has(c._id)) return false;
    if (query && !c.name?.toLowerCase().includes(query.toLowerCase()) && !c.email?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const initials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSubmit = async () => {
    if (!selectedUserId) { setError('Select a connection to invite'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onInvite(workspace._id, selectedUserId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite member');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(4,4,12,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 460,
            background: T.card, border: `1px solid ${T.borderH}`,
            borderRadius: 20, padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
              Invite Member
            </h2>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: T.muted2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </motion.button>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '9px 13px',
          }}>
            <Search size={13} style={{ color: T.muted2, flexShrink: 0 }} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search connections…"
              style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, flex: 1 }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Connections list */}
          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 20 }}>
            {eligible.length === 0 ? (
              <div style={{ textAlign: 'center', color: T.muted2, fontSize: 13, padding: '32px 0', fontFamily: "'DM Sans',sans-serif" }}>
                {connections?.length === 0 ? 'No connections yet' : 'All connections already in workspace'}
              </div>
            ) : eligible.map(user => (
              <motion.div
                key={user._id}
                onClick={() => setSelectedUserId(selectedUserId === user._id ? null : user._id)}
                whileHover={{ background: 'rgba(99,102,241,0.06)' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  border: selectedUserId === user._id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                  background: selectedUserId === user._id ? 'rgba(99,102,241,0.1)' : 'transparent',
                  marginBottom: 4, transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: '#fff',
                }}>
                  {initials(user.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${selectedUserId === user._id ? '#6366f1' : 'rgba(99,102,241,0.35)'}`,
                  background: selectedUserId === user._id ? '#6366f1' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selectedUserId === user._id && (
                    <svg width="9" height="7" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button onClick={onClose} whileTap={{ scale: 0.97 }}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </motion.button>
            <motion.button onClick={handleSubmit} disabled={submitting || !selectedUserId} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: (submitting || !selectedUserId) ? 'not-allowed' : 'pointer', opacity: (submitting || !selectedUserId) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              <UserPlus size={13} /> {submitting ? 'Inviting…' : 'Invite'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteMemberModal;
