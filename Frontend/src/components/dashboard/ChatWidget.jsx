import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Trash2, Bot,
  ChevronDown, Loader2, Sparkles,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { sendChatMessage, clearChatSession } from '../../services/chatService';

/* ── theme tokens ── */
const T = {
  bg:      '#04040c',
  card:    '#08080f',
  panel:   '#0b0b16',
  accent:  '#6366f1',
  accent2: '#8b5cf6',
  border:  'rgba(99,102,241,0.14)',
  borderH: 'rgba(99,102,241,0.4)',
  text:    '#f1f5f9',
  muted:   '#475569',
  muted2:  '#94a3b8',
};

/* ── helpers ── */
const scrollToBottom = (ref) => {
  if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
};

/* ── WorkspaceSelector ── */
function WorkspaceSelector({ workspaces, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = workspaces.find(w => w._id === selected);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          width: '100%', padding: '7px 12px', borderRadius: 9,
          background: 'rgba(99,102,241,0.07)',
          border: `1px solid ${open ? T.borderH : T.border}`,
          color: current ? T.text : T.muted2,
          fontFamily: "'DM Sans',sans-serif", fontSize: 12,
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
      >
        {current ? (
          <>
            <span style={{ fontSize: 14 }}>{current.avatar || '🏢'}</span>
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {current.name}
            </span>
          </>
        ) : (
          <span style={{ flex: 1, textAlign: 'left' }}>Select a workspace…</span>
        )}
        <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && workspaces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 10,
              background: '#0e0e1c', border: `1px solid ${T.border}`, borderRadius: 10,
              overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {workspaces.map(ws => (
              <button
                key={ws._id}
                onClick={() => { onChange(ws._id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  width: '100%', padding: '9px 12px',
                  background: ws._id === selected ? 'rgba(99,102,241,0.12)' : 'none',
                  border: 'none', color: T.text,
                  fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                  cursor: 'pointer', textAlign: 'left',
                  borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (ws._id !== selected) e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
                onMouseLeave={e => { if (ws._id !== selected) e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: 14 }}>{ws.avatar || '🏢'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── MessageBubble ── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 8, marginTop: 2,
        }}>
          <Bot size={12} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '9px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser
          ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))'
          : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isUser ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
        color: T.text,
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 12.5,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.text}
      </div>
    </div>
  );
}

/* ── TypingIndicator ── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bot size={12} color="#fff" />
      </div>
      <div style={{
        padding: '9px 13px', borderRadius: '14px 14px 14px 4px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: T.accent2, opacity: 0.7,
            animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 20px' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={20} style={{ color: T.accent }} />
      </div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
        Ask Meetra AI
      </div>
      <div style={{ fontSize: 11.5, color: T.muted2, textAlign: 'center', lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
        Ask about meetings, action items,<br />key decisions, or transcripts.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 6 }}>
        {[
          'What meetings happened this week?',
          'What are the pending action items?',
          'Search for meetings about the product launch',
        ].map(hint => (
          <div key={hint} style={{
            padding: '6px 12px', borderRadius: 8,
            background: 'rgba(99,102,241,0.06)', border: `1px solid ${T.border}`,
            color: T.muted2, fontSize: 11, fontFamily: "'DM Sans',sans-serif",
            cursor: 'default',
          }}>
            {hint}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ChatWidget ── */
const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { workspaces } = useWorkspaces();
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-select first workspace
  useEffect(() => {
    if (workspaces.length > 0 && !workspaceId) {
      setWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, workspaceId]);

  // Scroll to bottom whenever messages change
  useEffect(() => { scrollToBottom(messagesRef); }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const handleWorkspaceChange = (id) => {
    if (id !== workspaceId) {
      setWorkspaceId(id);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !workspaceId) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const reply = await sendChatMessage({
        workspaceId,
        message: text,
      });
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I could not reach the AI service. Make sure the chatbot server is running.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!workspaceId) return;
    setMessages([]);
    try { await clearChatSession({ workspaceId }); } catch { /* silent */ }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{`
        @keyframes chatDot {
          0%,80%,100% { transform: scale(0.7); opacity:0.5; }
          40%           { transform: scale(1);   opacity:1;   }
        }
        @keyframes chatPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50%      { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
        .chat-send-btn:hover { background: rgba(99,102,241,0.25) !important; }
        .chat-input:focus    { outline: none; }
      `}</style>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(99,102,241,0.55)',
          animation: open ? 'none' : 'chatPulse 2.5s ease-in-out infinite',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={20} /> : <MessageSquare size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', bottom: 92, right: 28, zIndex: 999,
              width: 360, height: 540,
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(6,6,18,0.8)', backdropFilter: 'blur(10px)',
              flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}>
                <Bot size={15} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  Meetra AI
                </div>
                <div style={{ fontSize: 10.5, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>
                  Workspace assistant
                </div>
              </div>
              {messages.length > 0 && (
                <motion.button
                  onClick={handleClear}
                  whileTap={{ scale: 0.9 }}
                  title="Clear conversation"
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: 'none',
                    background: 'rgba(239,68,68,0.08)', color: '#f87171',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={12} />
                </motion.button>
              )}
            </div>

            {/* Workspace selector */}
            <div style={{
              padding: '10px 14px 8px',
              borderBottom: `1px solid rgba(255,255,255,0.04)`,
              flexShrink: 0,
            }}>
              <WorkspaceSelector
                workspaces={workspaces}
                selected={workspaceId}
                onChange={handleWorkspaceChange}
              />
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              style={{
                flex: 1, overflowY: 'auto', padding: '14px 14px 0',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {messages.length === 0 && !loading
                ? <EmptyState />
                : (
                  <>
                    {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                    {loading && <TypingIndicator />}
                  </>
                )
              }
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px 14px',
              borderTop: `1px solid ${T.border}`,
              flexShrink: 0,
            }}>
              {!workspaceId && (
                <div style={{ fontSize: 11, color: '#f87171', marginBottom: 7, textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
                  Select a workspace to start chatting
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${T.border}`,
                borderRadius: 12, padding: '8px 8px 8px 13px',
                transition: 'border-color 0.2s',
              }}
                onFocus={() => {}}
              >
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={workspaceId ? 'Ask about meetings…' : 'Select a workspace first'}
                  disabled={!workspaceId || loading}
                  rows={1}
                  style={{
                    flex: 1, background: 'none', border: 'none',
                    color: T.text, fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12.5, resize: 'none', outline: 'none',
                    lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
                    padding: 0, cursor: workspaceId ? 'text' : 'not-allowed',
                    opacity: workspaceId ? 1 : 0.4,
                  }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !workspaceId}
                  whileTap={{ scale: 0.9 }}
                  className="chat-send-btn"
                  style={{
                    width: 32, height: 32, borderRadius: 9, border: 'none',
                    background: input.trim() && workspaceId && !loading
                      ? 'rgba(99,102,241,0.18)'
                      : 'rgba(255,255,255,0.04)',
                    color: input.trim() && workspaceId && !loading ? T.accent : T.muted,
                    cursor: input.trim() && workspaceId && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {loading
                    ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Send size={14} />
                  }
                </motion.button>
              </div>
              <div style={{ fontSize: 10, color: T.muted, textAlign: 'center', marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>
                Enter to send · Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default ChatWidget;
