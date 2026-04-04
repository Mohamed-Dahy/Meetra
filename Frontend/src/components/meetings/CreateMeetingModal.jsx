// components/meetings/CreateMeetingModal.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import api from "../../services/api"; // uses JWT interceptor automatically

const MODAL_STYLES = `
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
    padding: 16px;
  }
  .modal-card {
    background: var(--bg-card, #08080f);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px;
    padding: 32px;
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    position: relative;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08);
  }
  .modal-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
  }
  .modal-title {
    font-family: var(--sora, 'Sora'); font-size: 20px; font-weight: 700;
    color: var(--text, #f1f5f9); margin-bottom: 24px;
  }
  .m-field { margin-bottom: 16px; }
  .m-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted2, #94a3b8); margin-bottom: 7px;
  }
  .m-input {
    width: 100%; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
    padding: 11px 14px; font-family: var(--dm, 'DM Sans');
    font-size: 14px; color: var(--text, #f1f5f9);
    outline: none; transition: all 0.2s; resize: none;
  }
  .m-input::placeholder { color: var(--muted, #475569); }
  .m-input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.05);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .m-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .participant-list {
    max-height: 160px; overflow-y: auto;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 8px;
  }
  .participant-list::-webkit-scrollbar { width: 3px; }
  .participant-list::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 99px; }
  .participant-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 8px; cursor: pointer;
    transition: background 0.15s;
  }
  .participant-item:hover { background: rgba(99,102,241,0.08); }
  .participant-item.selected { background: rgba(99,102,241,0.12); }
  .p-checkbox {
    width: 16px; height: 16px; border-radius: 4px;
    border: 2px solid rgba(99,102,241,0.4);
    background: transparent; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; transition: all 0.15s;
  }
  .p-checkbox.checked { background: #6366f1; border-color: #6366f1; }
  .p-name { font-size: 13px; color: var(--text, #f1f5f9); font-weight: 500; }
  .p-email { font-size: 11px; color: var(--muted, #475569); }
  .m-err {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #f87171; margin-bottom: 16px;
  }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  @keyframes m-spin { to { transform: rotate(360deg); } }
  .m-spin { width:14px;height:14px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:m-spin 0.7s linear infinite; }
  .participants-count {
    font-size: 11px; color: var(--muted, #475569); margin-top: 6px;
  }
  .participants-count span { color: #818cf8; font-weight: 600; }
`;

export default function CreateMeetingModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "", location: "",
  });
  const [allUsers, setAllUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all users when modal opens
  useEffect(() => {
    if (!open) return;
    setError("");
    setSelectedIds([]);
    setForm({ title:"", description:"", date:"", time:"", location:"" });

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        // GET /meetra/auth/users — adjust if your endpoint differs
        const { data } = await api.get("/auth/users");
        setAllUsers(data.users || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [open]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleParticipant = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation matching backend requirements
    if (!form.title.trim())       { setError("Title is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    if (!form.date)               { setError("Date is required"); return; }
    if (!form.time)               { setError("Time is required"); return; }
    if (!form.location.trim())    { setError("Location is required"); return; }
    if (selectedIds.length < 2)   { setError("Select at least 2 participants"); return; }

    // Validate date is not in the past
    const selectedDate = new Date(`${form.date}T${form.time}`);
    if (selectedDate < new Date()) {
      setError("Date and time cannot be in the past");
      return;
    }

    setLoading(true);
    try {
      await onSuccess({
        title:        form.title.trim(),
        description:  form.description.trim(),
        date:         form.date,
        time:         form.time,
        location:     form.location.trim(),
        participants: selectedIds,
      });
      // onSuccess handles closing
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create meeting. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  // Get today's date in YYYY-MM-DD for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <style>{MODAL_STYLES}</style>
      <AnimatePresence>
        {open && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.94, y: 32, opacity: 0 }}
              animate={{ scale: 1,    y: 0,  opacity: 1 }}
              exit={{   scale: 0.94, y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div className="modal-title">New Meeting</div>

              {error && <div className="m-err">⚠ {error}</div>}

              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div className="m-field">
                  <label className="m-label">Meeting title</label>
                  <input className="m-input" name="title" type="text"
                    placeholder="Q3 Budget Review" autoFocus
                    value={form.title} onChange={handleChange} disabled={loading}/>
                </div>

                {/* Description */}
                <div className="m-field">
                  <label className="m-label">Description</label>
                  <textarea className="m-input" name="description" rows={3}
                    placeholder="What is this meeting about?"
                    value={form.description} onChange={handleChange} disabled={loading}/>
                </div>

                {/* Date + Time */}
                <div className="two-col">
                  <div className="m-field">
                    <label className="m-label">Date</label>
                    <input className="m-input" name="date" type="date"
                      min={today}
                      value={form.date} onChange={handleChange} disabled={loading}/>
                  </div>
                  <div className="m-field">
                    <label className="m-label">Time</label>
                    <input className="m-input" name="time" type="time"
                      value={form.time} onChange={handleChange} disabled={loading}/>
                  </div>
                </div>

                {/* Location */}
                <div className="m-field">
                  <label className="m-label">Location</label>
                  <input className="m-input" name="location" type="text"
                    placeholder="Conference Room A / Zoom / Google Meet"
                    value={form.location} onChange={handleChange} disabled={loading}/>
                </div>

                {/* Participants */}
                <div className="m-field">
                  <label className="m-label">
                    Participants
                    <span style={{ color:"#f87171", marginLeft:2 }}>*</span>
                    <span style={{ color:"var(--muted)",textTransform:"none",letterSpacing:0,fontWeight:400,marginLeft:6,fontSize:10 }}>(min. 2)</span>
                  </label>

                  {loadingUsers ? (
                    <div style={{ padding:"16px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
                      Loading users...
                    </div>
                  ) : allUsers.length === 0 ? (
                    <div style={{ padding:"16px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
                      No users found
                    </div>
                  ) : (
                    <div className="participant-list">
                      {allUsers.map(u => {
                        const isSelected = selectedIds.includes(u._id);
                        return (
                          <div key={u._id}
                            className={`participant-item ${isSelected ? "selected" : ""}`}
                            onClick={() => !loading && toggleParticipant(u._id)}>
                            <div className={`p-checkbox ${isSelected ? "checked" : ""}`}>
                              {isSelected && (
                                <svg width="8" height="6" viewBox="0 0 8 6">
                                  <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="p-name">{u.name}</div>
                              <div className="p-email">{u.email}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="participants-count">
                    <span>{selectedIds.length}</span> participant{selectedIds.length !== 1 ? "s" : ""} selected
                    {selectedIds.length < 2 && selectedIds.length > 0 && (
                      <span style={{ color:"#f87171" }}> — need at least 2</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button type="button"
                    style={{ background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"var(--muted2)",padding:"10px 20px",fontSize:13,fontWeight:600,fontFamily:"var(--sora)",cursor:"pointer",transition:"all 0.2s" }}
                    onClick={onClose} disabled={loading}
                    onMouseEnter={e=>e.target.style.borderColor="rgba(99,102,241,0.4)"}
                    onMouseLeave={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:13,fontWeight:700,fontFamily:"var(--sora)",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,display:"flex",alignItems:"center",gap:8,boxShadow:"0 0 24px rgba(99,102,241,0.35)",transition:"all 0.2s" }}
                    disabled={loading}>
                    {loading && <div className="m-spin"/>}
                    {loading ? "Creating..." : "Create Meeting"}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

CreateMeetingModal.propTypes = {
  open:      PropTypes.bool.isRequired,
  onClose:   PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};