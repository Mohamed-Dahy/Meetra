import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import * as userService from '../services/userService';

const T = {
  bg: '#04040c',
  card: '#08080f',
  border: 'rgba(99,102,241,0.14)',
  borderH: 'rgba(99,102,241,0.35)',
  accent: '#6366f1',
  text: '#f1f5f9',
  muted: '#475569',
  muted2: '#94a3b8',
  sora: "'Sora',sans-serif",
  dm: "'DM Sans',sans-serif",
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '11px 14px',
  fontFamily: T.dm,
  fontSize: 14,
  color: T.text,
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: T.muted2,
  marginBottom: 7,
  fontFamily: T.sora,
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        padding: '28px 32px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: '#818cf8' }} />
        </div>
        <h2 style={{ fontFamily: T.sora, fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    interests: Array.isArray(user?.interests) ? user.interests.join(', ') : (user?.interests || ''),
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || 'male',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await userService.updateProfile({
        name: profileForm.name,
        bio: profileForm.bio,
        interests: profileForm.interests,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        gender: profileForm.gender,
      });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 5) {
      toast.error('New password must be at least 5 characters');
      return;
    }
    setPwLoading(true);
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const userInitials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${T.accent}; border-radius: 99px; }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(99,102,241,0.5) !important;
          background: rgba(99,102,241,0.05) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            borderBottom: `1px solid ${T.border}`,
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(8,8,15,0.8)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
              borderRadius: 9, padding: '7px 14px',
              color: T.muted2, fontFamily: T.dm, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderH; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted2; e.currentTarget.style.borderColor = T.border; }}
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.sora, fontWeight: 800, fontSize: 13, color: '#fff',
            }}>M</div>
            <span style={{ fontFamily: T.sora, fontWeight: 700, fontSize: 16, color: T.text }}>Settings</span>
          </div>
        </motion.div>

        {/* Content */}
        <div style={{ flex: 1, maxWidth: 700, width: '100%', margin: '0 auto', padding: '36px 24px' }}>

          {/* User identity header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.sora, fontWeight: 700, fontSize: 20, color: '#fff',
              boxShadow: '0 0 24px rgba(99,102,241,0.35)',
            }}>{userInitials}</div>
            <div>
              <div style={{ fontFamily: T.sora, fontSize: 20, fontWeight: 700, color: T.text }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: T.muted2, marginTop: 2 }}>{user?.email}</div>
            </div>
          </motion.div>

          {/* Profile section */}
          <SectionCard title="Profile" icon={User}>
            <form onSubmit={handleProfileSave}>
              <Field label="Full name">
                <input
                  style={inputStyle}
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
              </Field>

              <Field label="Bio">
                <textarea
                  style={{ ...inputStyle, resize: 'none', height: 80 }}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  maxLength={512}
                />
              </Field>

              <Field label="Interests">
                <input
                  style={inputStyle}
                  type="text"
                  value={profileForm.interests}
                  onChange={e => setProfileForm({ ...profileForm, interests: e.target.value })}
                  placeholder="e.g. AI, Business, Tech (comma-separated)"
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Date of birth">
                  <input
                    style={inputStyle}
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={e => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  />
                </Field>

                <Field label="Gender">
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={profileForm.gender}
                    onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <motion.button
                  type="submit"
                  disabled={profileLoading}
                  whileHover={{ scale: profileLoading ? 1 : 1.02 }}
                  whileTap={{ scale: profileLoading ? 1 : 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 22px', fontFamily: T.sora, fontSize: 13,
                    fontWeight: 600, cursor: profileLoading ? 'not-allowed' : 'pointer',
                    opacity: profileLoading ? 0.6 : 1,
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  {profileLoading
                    ? <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                    : <><Save size={13} /> Save Profile</>
                  }
                </motion.button>
              </div>
            </form>
          </SectionCard>

          {/* Security section */}
          <SectionCard title="Change Password" icon={Lock}>
            <form onSubmit={handlePasswordSave}>
              <Field label="Current password">
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, paddingRight: 42 }}
                    type={showCurrent ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex' }}
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="New password">
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle, paddingRight: 42 }}
                      type={showNew ? 'text' : 'password'}
                      value={pwForm.newPassword}
                      onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      required
                      placeholder="Min. 5 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.muted, cursor: 'pointer', display: 'flex' }}
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm new password">
                  <input
                    style={inputStyle}
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    required
                    placeholder="Repeat new password"
                  />
                </Field>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <motion.button
                  type="submit"
                  disabled={pwLoading}
                  whileHover={{ scale: pwLoading ? 1 : 1.02 }}
                  whileTap={{ scale: pwLoading ? 1 : 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 22px', fontFamily: T.sora, fontSize: 13,
                    fontWeight: 600, cursor: pwLoading ? 'not-allowed' : 'pointer',
                    opacity: pwLoading ? 0.6 : 1,
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                  }}
                >
                  {pwLoading
                    ? <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                    : <><Lock size={13} /> Change Password</>
                  }
                </motion.button>
              </div>
            </form>
          </SectionCard>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
