import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Search } from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useAuth } from '../../hooks/useAuth';

const T = {
  card: '#08080f', border: 'rgba(99,102,241,0.13)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const roleColors = {
  owner: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  admin: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  member: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
};

const RoleBadge = ({ role }) => {
  const s = roleColors[role] || roleColors.member;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      fontFamily: "'Sora',sans-serif",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {role === 'owner' && <Crown size={9} />}{role}
    </span>
  );
};

const initials = (name) =>
  (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const SkeletonRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: 12, width: '35%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 7 }} />
      <div style={{ height: 10, width: '22%', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }} />
    </div>
  </div>
);

const TeamTab = () => {
  const { user } = useAuth();
  const { workspaces, loading } = useWorkspaces();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Flatten all members across all workspaces into a deduplicated list.
  // A person can appear in multiple workspaces — we keep the highest role
  // they hold across all workspaces and list every workspace they belong to.
  const members = useMemo(() => {
    const map = new Map();
    const roleRank = { owner: 3, admin: 2, member: 1 };

    workspaces.forEach(ws => {
      (ws.members || []).forEach(m => {
        const id = m.userId?._id || m.userId;
        if (!id) return;
        const name = m.userId?.name || '—';
        const email = m.userId?.email || '';
        const role = m.role || 'member';

        if (map.has(id)) {
          const existing = map.get(id);
          // Keep the highest role across workspaces
          if ((roleRank[role] || 0) > (roleRank[existing.role] || 0)) {
            existing.role = role;
          }
          existing.workspaces.push(ws.name);
        } else {
          map.set(id, { id, name, email, role, workspaces: [ws.name] });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      // Sort: current user first, then by role rank desc, then alphabetically
      if (a.id === user?._id) return -1;
      if (b.id === user?._id) return 1;
      const roleRankDiff = (roleRank[b.role] || 0) - (roleRank[a.role] || 0);
      if (roleRankDiff !== 0) return roleRankDiff;
      return a.name.localeCompare(b.name);
    });
  }, [workspaces, user]);

  const filtered = members.filter(m =>
    !query ||
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
          Team
        </h2>
        <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>
          {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''} across ${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18,
        background: searchFocused ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${searchFocused ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 11, padding: '9px 14px', maxWidth: 320, transition: 'all 0.25s',
      }}>
        <Search size={13} style={{ color: T.muted2, flexShrink: 0 }} />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
          placeholder="Search by name or email…"
          style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, flex: 1 }}
        />
      </div>

      {/* Members list */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '8px 24px' }}>
        {loading ? (
          [0,1,2,3].map(i => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Users size={32} style={{ color: 'rgba(99,102,241,0.3)', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: T.muted2, fontFamily: "'Sora',sans-serif" }}>
              {query ? 'No matching members' : 'No team members yet'}
            </div>
            {!query && (
              <div style={{ fontSize: 12, color: T.muted, marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>
                Invite people to your workspaces to see them here
              </div>
            )}
          </div>
        ) : filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: m.id === user?._id
                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                : 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: '#fff',
            }}>
              {initials(m.name)}
            </div>

            {/* Name + workspaces */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.name}
                {m.id === user?._id && (
                  <span style={{ fontSize: 10, color: '#6366f1', fontFamily: "'Sora',sans-serif" }}>(you)</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.email || m.workspaces.join(', ')}
              </div>
            </div>

            {/* Workspace count badge */}
            <div style={{ fontSize: 11, color: T.muted2, flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: T.muted }}>
                {m.workspaces.length} workspace{m.workspaces.length !== 1 ? 's' : ''}
              </div>
            </div>

            <RoleBadge role={m.role} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamTab;
