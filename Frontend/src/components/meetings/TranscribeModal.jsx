import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mic, FileText, Sparkles, Upload, CheckCircle,
  AlertCircle, Loader, ChevronDown, ChevronUp, Download,
} from 'lucide-react';
import * as transcriptionService from '../../services/transcriptionService';

const T = {
  bg: '#04040c', card: '#08080f', accent: '#6366f1', accent2: '#8b5cf6',
  border: 'rgba(99,102,241,0.13)', borderH: 'rgba(99,102,241,0.45)',
  text: '#f1f5f9', muted: '#475569', muted2: '#94a3b8',
};

const sentimentColor = { positive: '#4ade80', neutral: '#fbbf24', negative: '#f87171' };
const sentimentBg = {
  positive: 'rgba(34,197,94,0.12)',
  neutral: 'rgba(245,158,11,0.12)',
  negative: 'rgba(239,68,68,0.12)',
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted2, fontFamily: "'Sora',sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {title}
    </div>
    {children}
  </div>
);

const TranscribeModal = ({ meeting, onClose, onSuccess }) => {
  const [tab, setTab] = useState(meeting.transcript ? 'results' : 'audio');
  const [audioFile, setAudioFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState(meeting.transcript || '');
  const [analysis, setAnalysis] = useState(
    meeting.summary
      ? {
          summary: meeting.summary,
          actionItems: meeting.actionItems || [],
          keyDecisions: meeting.keyDecisions || [],
          sentiment: meeting.sentiment || 'neutral',
          healthScore: meeting.healthScore || 0,
        }
      : null
  );
  const [showTranscript, setShowTranscript] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');
  const fileInputRef = useRef();

  const handleAudioTranscribe = async () => {
    if (!audioFile) { setError('Please select an audio file.'); return; }
    setError(''); setTranscribing(true);
    try {
      const res = await transcriptionService.transcribeAudio(meeting._id, audioFile);
      setTranscript(res.data.transcript || '');
      setTab('results');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Transcription failed.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleTextTranscribe = async () => {
    if (!pasteText.trim()) { setError('Please paste a transcript.'); return; }
    setError(''); setTranscribing(true);
    try {
      const res = await transcriptionService.transcribeText(meeting._id, pasteText);
      setTranscript(res.data.transcript || pasteText);
      setTab('results');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transcript.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleAnalyze = async () => {
    setError(''); setAnalyzing(true);
    try {
      const res = await transcriptionService.analyzeMeeting(meeting._id);
      setAnalysis(res.data.analysis);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    setError(''); setExporting(true); setExportSuccess('');
    try {
      const res = await transcriptionService.exportPDF(meeting._id);
      setExportSuccess(res.data.fileName || 'Report generated');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: 'audio', label: 'Upload Audio', icon: Mic },
    { id: 'text', label: 'Paste Text', icon: FileText },
    ...(transcript ? [{ id: 'results', label: 'Results', icon: Sparkles }] : []),
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(4,4,12,0.88)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto',
            background: T.card, border: `1px solid ${T.borderH}`,
            borderRadius: 20, padding: 28, position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                Transcribe & Analyze
              </h2>
              <div style={{ fontSize: 12, color: T.muted2, fontFamily: "'DM Sans',sans-serif" }}>
                {meeting.title}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: T.muted2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X size={15} />
            </motion.button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 11, padding: 4 }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: active ? 600 : 400,
                    background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'none',
                    color: active ? '#fff' : T.muted2,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={12} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Tab: Upload Audio */}
          {tab === 'audio' && (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${audioFile ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                  cursor: 'pointer', marginBottom: 16,
                  background: audioFile ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}
              >
                <Upload size={28} style={{ color: audioFile ? '#818cf8' : T.muted, margin: '0 auto 10px' }} />
                {audioFile ? (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>{audioFile.name}</div>
                    <div style={{ fontSize: 11, color: T.muted2 }}>{(audioFile.size / 1024 / 1024).toFixed(1)} MB · Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.muted2, marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>Click to select audio file</div>
                    <div style={{ fontSize: 11, color: T.muted }}>MP3, MP4, WAV, M4A · Max 25 MB</div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*,video/mp4" style={{ display: 'none' }}
                onChange={e => { setAudioFile(e.target.files[0] || null); setError(''); }}
              />
              <motion.button
                onClick={handleAudioTranscribe}
                disabled={!audioFile || transcribing}
                whileHover={audioFile && !transcribing ? { scale: 1.02 } : {}}
                whileTap={audioFile && !transcribing ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 11, border: 'none',
                  background: audioFile && !transcribing ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                  color: audioFile && !transcribing ? '#fff' : T.muted,
                  fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: audioFile && !transcribing ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {transcribing ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Transcribing…</> : <><Mic size={14} /> Transcribe Audio</>}
              </motion.button>
            </div>
          )}

          {/* Tab: Paste Text */}
          {tab === 'text' && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.muted2, fontFamily: "'Sora',sans-serif", display: 'block', marginBottom: 8 }}>
                  Paste your meeting transcript
                </label>
                <textarea
                  value={pasteText}
                  onChange={e => { setPasteText(e.target.value); setError(''); }}
                  placeholder="Paste the full meeting transcript here…"
                  rows={8}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    padding: '10px 14px', color: T.text,
                    fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: 'none',
                    resize: 'vertical', minHeight: 140,
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
              <motion.button
                onClick={handleTextTranscribe}
                disabled={!pasteText.trim() || transcribing}
                whileHover={pasteText.trim() && !transcribing ? { scale: 1.02 } : {}}
                whileTap={pasteText.trim() && !transcribing ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 11, border: 'none',
                  background: pasteText.trim() && !transcribing ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                  color: pasteText.trim() && !transcribing ? '#fff' : T.muted,
                  fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
                  cursor: pasteText.trim() && !transcribing ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {transcribing ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><FileText size={14} /> Save Transcript</>}
              </motion.button>
            </div>
          )}

          {/* Tab: Results */}
          {tab === 'results' && (
            <div>
              {/* Transcript collapsible */}
              {transcript && (
                <div style={{ marginBottom: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setShowTranscript(v => !v)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer',
                      color: T.muted2, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={12} /> Transcript
                    </span>
                    {showTranscript ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {showTranscript && (
                    <div style={{ padding: '12px 14px', fontSize: 12, color: T.muted2, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif", maxHeight: 200, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {transcript}
                    </div>
                  )}
                </div>
              )}

              {/* Analyze button */}
              {!analysis && (
                <motion.button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  whileHover={!analyzing ? { scale: 1.02, boxShadow: '0 0 24px rgba(99,102,241,0.4)' } : {}}
                  whileTap={!analyzing ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%', padding: '13px 0', borderRadius: 11, border: 'none', marginBottom: 16,
                    background: analyzing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: analyzing ? T.muted : '#fff',
                    fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
                    cursor: analyzing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: analyzing ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  {analyzing
                    ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with AI…</>
                    : <><Sparkles size={14} /> Analyze with AI</>}
                </motion.button>
              )}

              {/* Analysis results */}
              {analysis && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <CheckCircle size={15} style={{ color: '#4ade80' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', fontFamily: "'Sora',sans-serif" }}>Analysis complete</span>
                    <button onClick={handleAnalyze} disabled={analyzing}
                      style={{ marginLeft: 'auto', fontSize: 11, color: T.muted2, background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', cursor: analyzing ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                    >
                      {analyzing ? 'Re-analyzing…' : 'Re-analyze'}
                    </button>
                  </div>

                  {/* Sentiment + Health */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <div style={{ flex: 1, background: sentimentBg[analysis.sentiment], border: `1px solid ${sentimentColor[analysis.sentiment]}30`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: T.muted2, marginBottom: 4, fontFamily: "'Sora',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sentiment</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: sentimentColor[analysis.sentiment], fontFamily: "'Sora',sans-serif", textTransform: 'capitalize' }}>{analysis.sentiment}</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: T.muted2, marginBottom: 6, fontFamily: "'Sora',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health Score</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ width: `${analysis.healthScore}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.6s ease' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', fontFamily: "'Sora',sans-serif", minWidth: 32, textAlign: 'right' }}>{analysis.healthScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {analysis.summary && (
                    <Section title="Summary">
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif", background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                        {analysis.summary}
                      </div>
                    </Section>
                  )}

                  {/* Action Items */}
                  {analysis.actionItems?.length > 0 && (
                    <Section title={`Action Items (${analysis.actionItems.length})`}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {analysis.actionItems.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 9 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, border: '1.5px solid rgba(139,92,246,0.4)', flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Key Decisions */}
                  {analysis.keyDecisions?.length > 0 && (
                    <Section title={`Key Decisions (${analysis.keyDecisions.length})`}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {analysis.keyDecisions.map((d, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 9 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', flexShrink: 0, marginTop: 5 }} />
                            <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{d}</span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Export PDF */}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {exportSuccess && (
                      <div style={{ marginBottom: 10, padding: '9px 14px', borderRadius: 9, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 12, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 7 }}>
                        <CheckCircle size={13} /> PDF generated: {exportSuccess}
                      </div>
                    )}
                    <motion.button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      whileHover={!exporting ? { scale: 1.01 } : {}}
                      whileTap={!exporting ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%', padding: '10px 0', borderRadius: 10,
                        border: '1px solid rgba(99,102,241,0.3)',
                        background: 'rgba(99,102,241,0.08)',
                        color: exporting ? T.muted : '#818cf8',
                        fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
                        cursor: exporting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        transition: 'all 0.2s',
                      }}
                    >
                      {exporting
                        ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                        : <><Download size={13} /> Export PDF Report</>}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}

          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TranscribeModal;
