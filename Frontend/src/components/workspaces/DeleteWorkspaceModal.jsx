import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const T = { card: '#08080f', muted2: '#94a3b8' };

const DeleteWorkspaceModal = ({ workspace, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await onConfirm(workspace._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workspace');
      setDeleting(false);
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
            width: '100%', maxWidth: 420,
            background: T.card, border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 20, padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                <AlertTriangle size={16} />
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Delete Workspace
              </h2>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: T.muted2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </motion.button>
          </div>

          <p style={{ fontSize: 14, color: T.muted2, lineHeight: 1.6, marginBottom: 20, fontFamily: "'DM Sans',sans-serif" }}>
            Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{workspace?.name}</strong>? All members will lose access. This action cannot be undone.
          </p>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button onClick={onClose} whileTap={{ scale: 0.97 }}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </motion.button>
            <motion.button onClick={handleConfirm} disabled={deleting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteWorkspaceModal;
