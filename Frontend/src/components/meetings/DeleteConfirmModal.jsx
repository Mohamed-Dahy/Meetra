// components/meetings/DeleteConfirmModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

/**
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Called when modal should close
 * @param {function} props.onDelete - Called when delete is confirmed
 * @param {Object} props.meeting - Meeting object to delete
 * @returns {JSX.Element}
 */
export default function DeleteConfirmModal({ open, onClose, onDelete, meeting }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="section-card w-full max-w-md p-8 relative text-center"
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="flex flex-col items-center mb-4">
              <AlertTriangle size={40} color="#fbbf24" className="mb-2" />
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)', fontFamily: 'var(--sora)' }}>Delete Meeting</h2>
              <div className="text-[var(--muted2)] mb-2">Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{meeting?.title}</span>?</div>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button
                type="button"
                className="btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}
                className="px-5 py-2 rounded font-semibold shadow-sm transition focus:outline-none"
                onClick={() => onDelete(meeting?._id)}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

DeleteConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  meeting: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
};
