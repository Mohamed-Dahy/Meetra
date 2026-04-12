import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell, Search, Plus, BarChart3, Users, Clock, Calendar } from 'lucide-react';

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
import ErrorBoundary from '../components/ErrorBoundary';
import TeamTab from '../components/dashboard/TeamTab';

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
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    // Each tab is wrapped in ErrorBoundary — if one tab crashes, only that tab
    // shows an error UI. The key={activeTab} resets the boundary when switching
    // tabs so a previously crashed tab gets a fresh attempt on next visit.
    switch (activeTab) {
      case 'overview':
        return (
          <ErrorBoundary key="overview">
            <OverviewTab
              meetings={meetings}
              loading={meetingsLoading}
              onNewMeeting={openCreateMeeting}
              setActiveTab={setActiveTab}
            />
          </ErrorBoundary>
        );
      case 'meetings':
        return (
          <ErrorBoundary key="meetings">
            <MeetingsTab
              meetings={meetings}
              loading={meetingsLoading}
              error={meetingsError}
              onNew={openCreateMeeting}
              onEdit={openEditMeeting}
              onDelete={openDeleteMeeting}
              onTranscribe={openTranscribeMeeting}
              // Global search from topbar is forwarded here.
              // MeetingsTab uses it as the initial query value.
              externalQuery={search}
            />
          </ErrorBoundary>
        );
      case 'connections':
        return (
          <ErrorBoundary key="connections">
            <ConnectionsTab />
          </ErrorBoundary>
        );
      case 'workspaces':
        return (
          <ErrorBoundary key="workspaces">
            <WorkspacesTab onCreateWorkspace={openCreateWorkspace} />
          </ErrorBoundary>
        );
      case 'analytics':
        return (
          <ErrorBoundary key="analytics">
            <AnalyticsTab meetings={meetings} />
          </ErrorBoundary>
        );
      case 'team':
        return (
          <ErrorBoundary key="team">
            <TeamTab />
          </ErrorBoundary>
        );
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
                  onChange={e => {
                    setSearch(e.target.value);
                    // Auto-switch to meetings tab when the user starts typing
                    // so the search results are immediately visible.
                    if (e.target.value) setActiveTab('meetings');
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Search meetings, tasks…"
                  style={{ background: 'none', border: 'none', outline: 'none', color: T.text, fontFamily: "'DM Sans',sans-serif", fontSize: 13, flex: 1 }}
                />
              </div>

              {/* Bell — shows upcoming meetings as notifications */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                {(() => {
                  const upcoming = meetings.filter(m => m.status === 'upcoming').slice(0, 10);
                  return (
                    <>
                      <motion.button
                        onClick={() => setNotifOpen(o => !o)}
                        whileTap={{ scale: 0.9 }}
                        style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: notifOpen ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${notifOpen ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: notifOpen ? '#e2e8f0' : T.muted2, position: 'relative', transition: 'all 0.2s' }}
                      >
                        <Bell size={15} />
                        {upcoming.length > 0 && (
                          <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)', border: '1.5px solid #04040c' }} />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {notifOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                            style={{
                              position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 200,
                              width: 300, background: '#0b0b18',
                              border: '1px solid rgba(99,102,241,0.18)', borderRadius: 14,
                              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                              overflow: 'hidden',
                            }}
                          >
                            <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>Upcoming Meetings</span>
                              <span style={{ fontSize: 10, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>{upcoming.length} scheduled</span>
                            </div>
                            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                              {upcoming.length === 0 ? (
                                <div style={{ padding: '24px 16px', textAlign: 'center', color: T.muted2, fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                                  <Calendar size={22} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                  No upcoming meetings
                                </div>
                              ) : upcoming.map((m, i) => (
                                <div
                                  key={m._id}
                                  onClick={() => { setActiveTab('meetings'); setNotifOpen(false); }}
                                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px', borderBottom: i < upcoming.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                >
                                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Clock size={12} style={{ color: '#fbbf24' }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{m.title}</div>
                                    <div style={{ fontSize: 11, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>
                                      {m.date ? new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                      {m.time ? ` · ${m.time}` : ''}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })()}
              </div>

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