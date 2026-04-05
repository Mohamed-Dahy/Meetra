import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const T = {
  card: '#08080f', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted2: '#94a3b8',
};

const EMOJIS = ['🏢', '💼', '🚀', '🎯', '📊', '🔬', '🎨', '💡', '⚡', '🌍'];

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

const EditWorkspaceModal = ({ workspace, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', description: '', avatar: '🏢' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (workspace) {
      setForm({
        name: workspace.name || '',
        description: workspace.description || '',
        avatar: workspace.avatar || '🏢',
      });
    }
  }, [workspace]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(workspace._id, form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update workspace');
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
            width: '100%', maxWidth: 480,
            background: T.card, border: `1px solid ${T.borderH}`,
            borderRadius: 20, padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
              Edit Workspace
            </h2>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: T.muted2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Avatar</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(emoji => (
                  <motion.button
                    key={emoji} type="button"
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setForm(f => ({ ...f, avatar: emoji }))}
                    style={{
                      width: 40, height: 40, borderRadius: 10, fontSize: 20, cursor: 'pointer',
                      border: form.avatar === emoji ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: form.avatar === emoji ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Workspace name"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Optional description" rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
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
                {submitting ? 'Saving…' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditWorkspaceModal;
