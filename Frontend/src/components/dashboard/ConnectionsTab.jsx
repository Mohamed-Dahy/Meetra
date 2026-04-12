import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Check, X, UserPlus, Search, Users } from 'lucide-react';
import { useConnections } from '../../hooks/useConnections';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const T = {
  card: '#08080f', border: 'rgba(99,102,241,0.13)', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const initials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const Avatar = ({ name, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.27), flexShrink: 0,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: Math.round(size * 0.33), color: '#fff',
  }}>
    {initials(name)}
  </div>
);

const SectionCard = ({ children, style }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20, flex: 1, minWidth: 0, ...style }}>
    {children}
  </div>
);

const SectionHeader = ({ title, count, highlight }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>{title}</span>
    {count !== undefined && (
      <span style={{
        display: 'inline-flex', alignItems: 'center', padding: '2px 9px',
        borderRadius: 99, fontSize: 11, fontWeight: 700,
        fontFamily: "'Sora',sans-serif",
        background: highlight && count > 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)',
        color: highlight && count > 0 ? '#818cf8' : T.muted2,
        border: highlight && count > 0 ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
      }}>
        {count}
      </span>
    )}
  </div>
);

const EmptyState = ({ msg }) => (
  <div style={{ textAlign: 'center', padding: '28px 0', color: T.muted2, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
    <Users size={22} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
    {msg}
  </div>
);

const ConnectionsTab = () => {
  const { user } = useAuth();
  const {
    connections, receivedRequests, sentRequests,
    loading, error,
    sendRequest, acceptRequest, rejectRequest, removeConnection,
  } = useConnections();

  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Debounced search — only fires a request after the user stops typing for
  // 400ms and has typed at least 2 characters. This replaces the old approach
  // of loading ALL users on mount, which becomes a problem as the user base grows.
  useEffect(() => {
    if (query.length < 2) {
      setAllUsers([]);
      return;
    }
    const timer = setTimeout(async () => {
      setUsersLoading(true);
      try {
        // Pass search query and a page size limit to the backend.
        // Backend returns up to 20 matches — enough for the UI panel.
        const res = await api.get(`/auth/users?search=${encodeURIComponent(query)}&limit=20`);
        setAllUsers(res.data.users || res.data.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setUsersLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const withLoading = async (id, fn) => {
    setActionLoading(s => ({ ...s, [id]: true }));
    try { await fn(); } catch (err) { console.error(err); }
    finally { setActionLoading(s => ({ ...s, [id]: false })); }
  };

  const connectionIds = new Set(connections.map(c => c._id));
  const sentIds = new Set(sentRequests.map(c => c._id));

  const filteredUsers = allUsers.filter(u => {
    if (u._id === user?._id) return false;
    if (connectionIds.has(u._id)) return false;
    if (query && !u.name?.toLowerCase().includes(query.toLowerCase()) && !u.email?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20, height: 200 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Connections</h2>
        <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>Manage your network and discover new connections</div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

        {/* ── My Connections ── */}
        <SectionCard>
          <SectionHeader title="Connections" count={connections.length} />
          {connections.length === 0 ? (
            <EmptyState msg="No connections yet" />
          ) : connections.map(c => (
            <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Avatar name={c.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
              </div>
              <motion.button
                onClick={() => withLoading(c._id, () => removeConnection(c._id))}
                disabled={actionLoading[c._id]}
                whileTap={{ scale: 0.9 }}
                title="Remove connection"
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.07)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: actionLoading[c._id] ? 0.5 : 1 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
              >
                <Trash2 size={12} />
              </motion.button>
            </motion.div>
          ))}
        </SectionCard>

        {/* ── Received Requests ── */}
        <SectionCard>
          <SectionHeader title="Requests" count={receivedRequests.length} highlight />
          {receivedRequests.length === 0 ? (
            <EmptyState msg="No pending requests" />
          ) : receivedRequests.map(r => (
            <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Avatar name={r.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <motion.button
                  onClick={() => withLoading(`a-${r._id}`, () => acceptRequest(r._id))}
                  disabled={actionLoading[`a-${r._id}`]}
                  whileTap={{ scale: 0.9 }} title="Accept"
                  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.1)', color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: actionLoading[`a-${r._id}`] ? 0.5 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
                >
                  <Check size={12} />
                </motion.button>
                <motion.button
                  onClick={() => withLoading(`r-${r._id}`, () => rejectRequest(r._id))}
                  disabled={actionLoading[`r-${r._id}`]}
                  whileTap={{ scale: 0.9 }} title="Reject"
                  style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.07)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: actionLoading[`r-${r._id}`] ? 0.5 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                >
                  <X size={12} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </SectionCard>

        {/* ── Find & Add ── */}
        <SectionCard>
          <SectionHeader title="Find & Add" />
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 9, padding: '8px 12px',
          }}>
            <Search size={12} style={{ color: T.muted2, flexShrink: 0 }} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search people…"
              style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 12, flex: 1 }}
            />
          </div>

          {query.length < 2 ? (
            <EmptyState msg="Type at least 2 characters to search" />
          ) : usersLoading ? (
            <div style={{ color: T.muted2, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Searching…</div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState msg="No users found" />
          ) : filteredUsers.map(u => {
            const isPending = sentIds.has(u._id);
            return (
              <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <Avatar name={u.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                {isPending ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', flexShrink: 0, fontFamily: "'Sora',sans-serif" }}>
                    Pending
                  </span>
                ) : (
                  <motion.button
                    onClick={() => withLoading(`s-${u._id}`, () => sendRequest(u._id))}
                    disabled={actionLoading[`s-${u._id}`]}
                    whileTap={{ scale: 0.9 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: 11, fontWeight: 600, fontFamily: "'Sora',sans-serif", cursor: 'pointer', flexShrink: 0, opacity: actionLoading[`s-${u._id}`] ? 0.5 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                  >
                    <UserPlus size={11} /> Connect
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </SectionCard>
      </div>
    </div>
  );
};

export default ConnectionsTab;
