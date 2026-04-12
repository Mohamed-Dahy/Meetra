import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
      <div style={{
        minHeight: '100vh', background: '#04040c',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans',sans-serif", padding: 24,
      }}>
        {/* Glowing orb */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', zIndex: 1 }}
        >
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 28px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(99,102,241,0.6)',
            }}
          >
            <Compass size={32} />
          </motion.div>

          {/* 404 */}
          <div style={{
            fontFamily: "'Sora',sans-serif", fontSize: 80, fontWeight: 800, lineHeight: 1,
            background: 'linear-gradient(135deg,#818cf8,#a78bfa,#67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 16,
          }}>
            404
          </div>

          <div style={{
            fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700,
            color: '#fff', marginBottom: 10,
          }}>
            Page not found
          </div>
          <div style={{
            fontSize: 13, color: '#94a3b8', lineHeight: 1.7,
            maxWidth: 320, margin: '0 auto 32px',
          }}>
            The page you're looking for doesn't exist or has been moved.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                color: '#94a3b8', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
              }}
            >
              <ArrowLeft size={14} /> Go back
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
                boxShadow: '0 0 20px rgba(99,102,241,0.3)',
              }}
            >
              Go to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFoundPage;
