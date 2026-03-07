// components/meetings/CreateMeetingModal.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import axios from "axios"; // for fetching users

export default function CreateMeetingModal({ open, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users to show as options
  useEffect(() => {
    if (!open) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users"); // adjust endpoint
        setParticipants(res.data.users || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (selectedParticipants.length < 2) {
      setError("Select at least 2 participants");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSuccess({ title, participants: selectedParticipants });
      setTitle("");
      setSelectedParticipants([]);
      onClose();
    } catch (err) {
      setError("Failed to create meeting");
    }
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="section-card w-full max-w-md p-8 relative"
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--text)", fontFamily: "var(--sora)" }}
            >
              New Meeting
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="field-label mb-2">Meeting Title</label>
              <input
                className="field-input w-full mb-4"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
                placeholder="Enter meeting title"
              />

              <label className="field-label mb-2">Participants</label>
              <div className="mb-4 max-h-40 overflow-y-auto border p-2 rounded">
                {participants.map((user) => (
                  <div key={user._id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={user._id}
                      checked={selectedParticipants.includes(user._id)}
                      onChange={() => toggleParticipant(user._id)}
                      disabled={loading}
                    />
                    <label htmlFor={user._id} className="ml-2">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>

              {error && <div className="err-box mb-3">{error}</div>}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && <span className="spin w-4 h-4" />}
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

CreateMeetingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};