import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ArrowLeft, Eye, Pencil, Trash2, LogOut, UserPlus, Crown } from 'lucide-react';

import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useConnections } from '../../hooks/useConnections';
import { useAuth } from '../../hooks/useAuth';
import * as workspaceService from '../../services/workspaceService';

import CreateWorkspaceModal from '../workspaces/CreateWorkspaceModal';
import EditWorkspaceModal from '../workspaces/EditWorkspaceModal';
import DeleteWorkspaceModal from '../workspaces/DeleteWorkspaceModal';
import InviteMemberModal from '../workspaces/InviteMemberModal';

const T = {
  card: '#08080f',
  border: 'rgba(99,102,241,0.13)',
  borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9',
  muted: '#475569',
  muted2: '#94a3b8',
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
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>
      {role === 'owner' && <Crown size={9} />} {role}
    </span>
  );
};

const initials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getUserRole = (workspace, userId) => {
  if (!workspace || !userId) return null;
  const member = (workspace.members || []).find(m => 
    (m.userId?._id || m.userId) === userId
  );
  return member?.role || null;
};

const isWorkspaceOwner = (workspace, userId) => {
  if (!workspace || !userId) return false;
  return (workspace.owner?._id || workspace.owner) === userId;
};

const SkeletonCard = () => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 22, height: 180 }} />
);

/* ── Workspace Detail View ── */
const WorkspaceDetail = ({ workspace, currentUser, connections, onBack, onInvite, onRemoveMember, onLeave }) => {
  const isOwner = isWorkspaceOwner(workspace, currentUser?._id);
  const myRole = getUserRole(workspace, currentUser?._id) || (isOwner ? 'owner' : 'member');

  const [showInvite, setShowInvite] = useState(false);
  const [removing, setRemoving] = useState({});

  const handleRemoveMember = async (userId) => {
    setRemoving(s => ({ ...s, [userId]: true }));
    try {
      await onRemoveMember(workspace._id, userId);
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(s => ({ ...s, [userId]: false }));
    }
  };

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <motion.button 
          onClick={onBack} 
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 14px', borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.1)', background: 'none',
            color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontSize: 13,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={13} /> Back
        </motion.button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 32 }}>{workspace.avatar || '🏢'}</div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {workspace.name}
            </div>
            {workspace.description && (
              <div style={{ fontSize: 12, color: T.muted2, marginTop: 2 }}>{workspace.description}</div>
            )}
          </div>
          <RoleBadge role={myRole} />
        </div>
      </div>

      {/* Members card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} style={{ color: '#6366f1' }} /> Members
            <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: T.muted2, fontFamily: "'Sora',sans-serif" }}>
              {workspace.members?.length || 0}
            </span>
          </div>
          {(isOwner || myRole === 'admin') && (
            <motion.button 
              onClick={() => setShowInvite(true)} 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9,
                border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)',
                color: '#818cf8', fontFamily: "'Sora',sans-serif", fontSize: 12,
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              <UserPlus size={12} /> Invite
            </motion.button>
          )}
        </div>

        {(workspace.members || []).map(member => {
          const mId = member.userId?._id || member.userId;
          const mName = member.userId?.name || '—';
          const mEmail = member.userId?.email || '';
          return (
            <div key={mId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0 }}>
                {initials(mName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 1 }}>{mName}</div>
                <div style={{ fontSize: 11, color: T.muted2 }}>{mEmail}</div>
              </div>
              <RoleBadge role={member.role} />
              {isOwner && mId !== currentUser?._id && (
                <motion.button 
                  onClick={() => handleRemoveMember(mId)} 
                  disabled={removing[mId]} 
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 28, height: 28, borderRadius: 7,
                    border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.07)',
                    color: '#f87171', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    opacity: removing[mId] ? 0.5 : 1
                  }}
                >
                  <Trash2 size={11} />
                </motion.button>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showInvite && (
          <InviteMemberModal
            workspace={workspace}
            connections={connections}
            onClose={() => setShowInvite(false)}
            onInvite={onInvite}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main WorkspacesTab ── */
const WorkspacesTab = () => {
  const { user } = useAuth();
  const {
    workspaces,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    removeMember,
    leaveWorkspace,
  } = useWorkspaces();

  const { connections } = useConnections();

  const [viewingId, setViewingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingWs, setEditingWs] = useState(null);
  const [deletingWs, setDeletingWs] = useState(null);
  const [detailWorkspace, setDetailWorkspace] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleView = async (ws) => {
    setViewingId(ws._id);
    setLoadingDetail(true);
    try {
      const res = await workspaceService.getWorkspaceById(ws._id);
      setDetailWorkspace(res.data?.workspace || res.data?.data || ws);
    } catch (err) {
      console.error(err);
      setDetailWorkspace(ws);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBack = () => {
    setViewingId(null);
    setDetailWorkspace(null);
  };

  

  // Sync detail view when workspaces list updates
  useEffect(() => {
    if (viewingId && workspaces.length > 0) {
      const updated = workspaces.find(w => w._id === viewingId);
      if (updated) setDetailWorkspace(updated);
    }
  }, [workspaces, viewingId]);

  // Close create modal after successful creation (handled inside modal now)
const handleCreateSubmit = async (formData) => {
    await createWorkspace(formData);   // This will throw on error (handled in modal)
    // If we reach here → success
    setShowCreate(false);
  };

  if (viewingId) {
    if (loadingDetail) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.muted2, fontSize: 13 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          Loading workspace...
        </div>
      );
    }
    return detailWorkspace ? (
      <WorkspaceDetail
        workspace={detailWorkspace}
        currentUser={user}
        connections={connections}
        onBack={handleBack}
        onInvite={inviteMember}
        onRemoveMember={removeMember}
        onLeave={leaveWorkspace}
      />
    ) : null;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
            Workspaces
          </h2>
          <div style={{ fontSize: 13, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>
            {loading ? 'Loading…' : `${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        <motion.button 
          onClick={() => setShowCreate(true)} 
          whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(99,102,241,0.4)' }} 
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '9px 18px',
            fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 0 16px rgba(99,102,241,0.25)'
          }}
        >
          <Plus size={14} /> New Workspace
        </motion.button>
      </div>

      {error && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif"
        }}>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🏢</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.muted2, marginBottom: 8, fontFamily: "'Sora',sans-serif" }}>
            No workspaces yet
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 20, fontFamily: "'DM Sans',sans-serif" }}>
            Create a workspace to collaborate with your team
          </div>
          <motion.button 
            onClick={() => setShowCreate(true)} 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
              fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} /> Create Workspace
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {workspaces.map((ws, i) => {
            const isOwner = isWorkspaceOwner(ws, user?._id);
            const myRole = getUserRole(ws, user?._id) || (isOwner ? 'owner' : 'member');
            const canEdit = isOwner || myRole === 'admin';
            const ownerName = ws.owner?.name || ws.owner || 'Unknown';

            return (
              <motion.div
                key={ws._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ borderColor: T.borderH, boxShadow: '0 0 28px rgba(99,102,241,0.1)' }}
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'border-color 0.3s, box-shadow 0.3s'
                }}
              >
                {/* Card content remains the same as your original */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ fontSize: 34, flexShrink: 0, lineHeight: 1, background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: '8px 10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                    {ws.avatar || '🏢'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Sora',sans-serif" }}>
                      {ws.name}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>
                      {ws.description || 'No description'}
                    </div>
                  </div>
                  <RoleBadge role={myRole} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.muted2 }}>
                    <Users size={12} style={{ color: '#818cf8' }} /> {ws.members?.length || 0} members
                  </span>
                  <span style={{ fontSize: 12, color: T.muted }}>·</span>
                  <span style={{ fontSize: 12, color: T.muted2 }}>by {ownerName}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <motion.button 
                    onClick={() => handleView(ws)} 
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 13px', borderRadius: 8,
                      border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.08)',
                      color: '#818cf8', fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                      fontWeight: 500, cursor: 'pointer'
                    }}
                  >
                    <Eye size={12} /> View
                  </motion.button>

                  {canEdit && (
                    <motion.button 
                      onClick={() => setEditingWs(ws)} 
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 13px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                        color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                        fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      <Pencil size={12} /> Edit
                    </motion.button>
                  )}

                  <motion.button
                    onClick={() => isOwner ? setDeletingWs(ws) : leaveWorkspace(ws._id)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 13px', borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.07)',
                      color: '#f87171', fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                      fontWeight: 500, cursor: 'pointer'
                    }}
                  >
                    {isOwner ? <><Trash2 size={12} /> Delete</> : <><LogOut size={12} /> Leave</>}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateWorkspaceModal 
            onClose={() => setShowCreate(false)} 
            onSubmit={handleCreateSubmit}     // ← Fixed: Using wrapper for better control
          />
        )}

        {editingWs && (
          <EditWorkspaceModal 
            workspace={editingWs} 
            onClose={() => setEditingWs(null)} 
            onSubmit={updateWorkspace} 
          />
        )}

        {deletingWs && (
          <DeleteWorkspaceModal 
            workspace={deletingWs} 
            onClose={() => setDeletingWs(null)} 
            onConfirm={deleteWorkspace} 
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default WorkspacesTab;