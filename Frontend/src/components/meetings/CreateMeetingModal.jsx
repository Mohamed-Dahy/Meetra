import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, FileText, AlignLeft, Users, Layout } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as workspaceService from '../../services/workspaceService';
import * as connectionService from '../../services/connectionService';

const T = {
  card: '#08080f', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '10px 14px', color: T.text,
  fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: 'none',
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: T.muted2,
  fontFamily: "'Sora',sans-serif", marginBottom: 6, display: 'block',
};

const today = new Date().toISOString().split('T')[0];

const initials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const CreateMeetingModal = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', location: '', workspaceId: '',
  });
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [connections, setConnections] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [wsRes, connRes] = await Promise.all([
          workspaceService.getMyWorkspaces(),
          connectionService.getMyConnections(),
        ]);
        setWorkspaces(wsRes.data.workspaces || wsRes.data.data || []);
        setConnections(connRes.data.connections || connRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleParticipant = (id) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())       { setError('Title is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.date)               { setError('Date is required'); return; }
    if (!form.time)               { setError('Time is required'); return; }
    if (!form.location.trim())    { setError('Location is required'); return; }
    if (!form.workspaceId)        { setError('Please select a workspace'); return; }
    if (selectedParticipants.length === 0) { setError('Add at least 1 participant'); return; }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        participants: selectedParticipants,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create meeting');
    } finally {
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
          background: 'rgba(4,4,12,0.88)', backdropFilter: 'blur(8px)',
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
            width: '100%', maxWidth: 540,
            background: T.card, border: `1px solid ${T.borderH}`,
            borderRadius: 20, padding: 28,
            maxHeight: '90vh', overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
              New Meeting
            </h2>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: T.muted2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </motion.button>
          </div>

          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted2, fontSize: 13 }}>Loading data…</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
                  {error}
                </div>
              )}

              {/* Workspace */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}><Layout size={11} style={{ display: 'inline', marginRight: 5 }} />Workspace *</label>
                {workspaces.length === 0 ? (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12 }}>
                    No workspaces found. Create a workspace first.
                  </div>
                ) : (
                  <select name="workspaceId" value={form.workspaceId} onChange={handleChange}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <option value="" style={{ background: '#08080f' }}>Select workspace…</option>
                    {workspaces.map(ws => (
                      <option key={ws._id} value={ws._id} style={{ background: '#08080f' }}>
                        {ws.avatar || '🏢'} {ws.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}><FileText size={11} style={{ display: 'inline', marginRight: 5 }} />Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Meeting title"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}><AlignLeft size={11} style={{ display: 'inline', marginRight: 5 }} />Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Meeting description" rows={2}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 68 }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {/* Date + Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}><Calendar size={11} style={{ display: 'inline', marginRight: 5 }} />Date *</label>
                  <input type="date" name="date" value={form.date} min={today} onChange={handleChange}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}><Clock size={11} style={{ display: 'inline', marginRight: 5 }} />Time *</label>
                  <input type="time" name="time" value={form.time} onChange={handleChange}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              {/* Location */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}><MapPin size={11} style={{ display: 'inline', marginRight: 5 }} />Location *</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Meeting location"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {/* Participants */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ ...labelStyle, marginBottom: 8 }}>
                  <Users size={11} style={{ display: 'inline', marginRight: 5 }} />
                  Participants * ({selectedParticipants.length} selected)
                </label>
                {connections.length === 0 ? (
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: 12 }}>
                    No connections yet. Add connections first to invite participants.
                  </div>
                ) : (
                  <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
                    {connections.map(c => {
                      const checked = selectedParticipants.includes(c._id);
                      return (
                        <div
                          key={c._id}
                          onClick={() => toggleParticipant(c._id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', cursor: 'pointer',
                            background: checked ? 'rgba(99,102,241,0.1)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                            border: `2px solid ${checked ? '#6366f1' : 'rgba(99,102,241,0.35)'}`,
                            background: checked ? '#6366f1' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {checked && <svg width="8" height="6" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>}
                          </div>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 10, color: '#fff', flexShrink: 0 }}>
                            {initials(c.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.name}</div>
                            <div style={{ fontSize: 10, color: T.muted2 }}>{c.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </motion.button>
                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Creating…' : 'Create Meeting'}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateMeetingModal;
