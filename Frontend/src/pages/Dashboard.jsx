import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell, Search, Plus, BarChart3, Users } from 'lucide-react';

import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useMeetings } from '../hooks/useMeetings';

import OverviewTab from '../components/dashboard/OverviewTab';
import MeetingsTab from '../components/dashboard/MeetingsTab';
import ConnectionsTab from '../components/dashboard/ConnectionsTab';
import WorkspacesTab from '../components/dashboard/WorkspacesTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';

import CreateMeetingModal from '../components/meetings/CreateMeetingModal';
import EditMeetingModal from '../components/meetings/EditMeetingModal';
import DeleteConfirmModal from '../components/meetings/DeleteConfirmModal';
import TranscribeModal from '../components/meetings/TranscribeModal';
import ChatWidget from '../components/dashboard/ChatWidget';

const T = {
  bg: '#04040c',
  card: '#08080f',
  accent: '#6366f1',
  accent2: '#8b5cf6',
  border: 'rgba(99,102,241,0.13)',
  borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9',
  muted: '#475569',
  muted2: '#94a3b8',
};

const ComingSoon = ({ label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(99,102,241,0.5)' }}>
      {label === 'Analytics' ? <BarChart3 size={28} /> : <Users size={28} />}
    </div>
    <div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: T.muted2, textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>Coming soon — this feature is under development</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [searchFocused, setFocused] = useState(false);

  // Meeting modals
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);
  const [transcribingMeeting, setTranscribingMeeting] = useState(null);

  // Workspace modal
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const { user } = useAuth();
  const {
    meetings,
    loading: meetingsLoading,
    error: meetingsError,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting
  } = useMeetings();

  // Open/Close handlers
  const openCreateMeeting = () => setShowCreateMeeting(true);
  const openEditMeeting = (meeting) => setEditingMeeting(meeting);
  const openDeleteMeeting = (meeting) => setDeletingMeeting(meeting);
  const openTranscribeMeeting = (meeting) => setTranscribingMeeting(meeting);

  const openCreateWorkspace = () => setShowCreateWorkspace(true);

  // Success handlers (close modal only after successful API call)
  const handleCreateMeetingSuccess = async (data) => {
    await createMeeting(data);
    setShowCreateMeeting(false);
  };

  const handleCreateWorkspaceSuccess = async (data) => {
    // This will be passed to WorkspacesTab
    // WorkspacesTab will handle its own createWorkspace from useWorkspaces
    setShowCreateWorkspace(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            meetings={meetings}
            loading={meetingsLoading}
            onNewMeeting={openCreateMeeting}
            setActiveTab={setActiveTab}
          />
        );
      case 'meetings':
        return (
          <MeetingsTab
            meetings={meetings}
            loading={meetingsLoading}
            error={meetingsError}
            onNew={openCreateMeeting}
            onEdit={openEditMeeting}
            onDelete={openDeleteMeeting}
            onTranscribe={openTranscribeMeeting}
          />
        );
      case 'connections':
        return <ConnectionsTab />;
      case 'workspaces':
        return (
          <WorkspacesTab 
            onCreateWorkspace={openCreateWorkspace}   // Pass open function if needed
          />
        );
      case 'analytics':
        return <AnalyticsTab meetings={meetings} />;
      case 'team':
        return <ComingSoon label="Team" />;
      default:
        return null;
    }
  };

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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div className="d-noise" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Right panel */}
        <div className="d-grid" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* TOPBAR */}
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: 60, flexShrink: 0,
              background: 'rgba(4,4,12,0.88)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(99,102,241,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 28px', gap: 16,
            }}
          >
            {/* Welcome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff' }}>
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </span>
              <motion.span animate={{ rotate: [0, 14, -8, 14, 0], scale: [1, 1.2, 1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}>
                <Sparkles size={16} style={{ color: '#fbbf24' }} />
              </motion.span>
            </div>

            {/* Search + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9, width: 240,
                background: searchFocused ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${searchFocused ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 11, padding: '7px 13px', transition: 'all 0.25s',
              }}>
                <Search size={13} style={{ color: T.muted2, flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Search meetings, tasks…"
                  style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, flex: 1 }}
                />
              </div>

              {/* Bell */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted2, position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = T.muted2; }}
              >
                <Bell size={15} />
                <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)' }} />
              </motion.button>

              {/* New Meeting CTA */}
              <motion.button
                onClick={openCreateMeeting}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(99,102,241,0.45)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              >
                <Plus size={14} /> New Meeting
              </motion.button>
            </div>
          </motion.header>

          {/* TAB CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Floating Chatbot ── */}
      <ChatWidget />

      {/* ── Meeting Modals ── */}
      <AnimatePresence>
        {showCreateMeeting && (
          <CreateMeetingModal
            onClose={() => setShowCreateMeeting(false)}
            onSubmit={handleCreateMeetingSuccess}
          />
        )}
        {editingMeeting && (
          <EditMeetingModal
            meeting={editingMeeting}
            onClose={() => setEditingMeeting(null)}
            onSubmit={updateMeeting}
          />
        )}
        {deletingMeeting && (
          <DeleteConfirmModal
            title="Delete Meeting"
            message={`Are you sure you want to delete "${deletingMeeting.title}"? This action cannot be undone.`}
            onClose={() => setDeletingMeeting(null)}
            onConfirm={() => deleteMeeting(deletingMeeting._id)}
          />
        )}
        {transcribingMeeting && (
          <TranscribeModal
            meeting={transcribingMeeting}
            onClose={() => setTranscribingMeeting(null)}
            onSuccess={fetchMeetings}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;