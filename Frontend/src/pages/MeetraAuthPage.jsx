import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Calendar, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:       #04040c;
    --card:     #080810;
    --accent:   #6366f1;
    --accent2:  #8b5cf6;
    --border:   rgba(99,102,241,0.15);
    --text:     #f1f5f9;
    --muted:    #475569;
    --muted2:   #94a3b8;
    --sora:     'Sora', sans-serif;
    --dm:       'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); font-family: var(--dm); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }

  .auth-noise::after {
    content:''; position:fixed; inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:.022; pointer-events:none; z-index:9999;
  }

  .auth-grid {
    background-image:
      linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px);
    background-size: 52px 52px;
  }

  .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
  .orb-1 { width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%);top:-200px;left:-150px; }
  .orb-2 { width:400px;height:400px;background:radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%);bottom:-100px;right:-100px; }

  .gt {
    background: linear-gradient(135deg,#818cf8,#a78bfa,#67e8f9);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .field-wrap { position:relative; margin-bottom:16px; }
  .field-label { display:block; font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--muted2); margin-bottom:7px; }
  .field-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; display:flex; align-items:center; }

  .field-input {
    width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:11px; padding:12px 14px 12px 42px; font-family:var(--dm); font-size:14px;
    color:var(--text); outline:none; transition:all 0.25s; -webkit-appearance:none;
  }
  .field-input::placeholder { color:var(--muted); }
  .field-input:focus { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.06); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }

  .field-bare {
    width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:11px; padding:12px 14px; font-family:var(--dm); font-size:14px;
    color:var(--text); outline:none; transition:all 0.25s; -webkit-appearance:none;
  }
  .field-bare::placeholder { color:var(--muted); }
  .field-bare:focus { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.06); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }

  .field-textarea {
    width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:11px; padding:12px 14px; font-family:var(--dm); font-size:14px;
    color:var(--text); outline:none; transition:all 0.25s; resize:none; height:76px;
  }
  .field-textarea::placeholder { color:var(--muted); }
  .field-textarea:focus { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.06); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--muted); cursor:pointer; display:flex; align-items:center; transition:color 0.2s; }
  .eye-btn:hover { color:var(--muted2); }

  .tab-bar { display:flex; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:4px; margin-bottom:28px; }
  .tab-btn { flex:1; padding:10px; border:none; border-radius:9px; font-family:var(--sora); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.25s; background:transparent; color:var(--muted); }
  .tab-btn.active { background:rgba(99,102,241,0.18); color:#a5b4fc; border:1px solid rgba(99,102,241,0.28); box-shadow:0 2px 12px rgba(99,102,241,0.15); }
  .tab-btn:not(.active):hover { color:var(--muted2); }

  .submit-btn {
    width:100%; padding:14px; border:none; border-radius:12px;
    background:linear-gradient(135deg,#6366f1,#8b5cf6,#6366f1); background-size:200% auto;
    color:#fff; font-family:var(--sora); font-size:14px; font-weight:700;
    cursor:pointer; transition:all 0.3s; margin-top:8px;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 28px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.2);
    position:relative; overflow:hidden;
  }
  .submit-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent,rgba(255,255,255,0.1),transparent); transform:translateX(-100%); transition:transform 0.5s ease; }
  .submit-btn:hover:not(:disabled) { background-position:right center; box-shadow:0 6px 40px rgba(99,102,241,0.6); transform:translateY(-1px); }
  .submit-btn:hover::before { transform:translateX(100%); }
  .submit-btn:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

  @keyframes spin { to { transform:rotate(360deg); } }
  .spin { width:16px;height:16px;border:2px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite; }

  .err-box { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:11px; padding:12px 14px; display:flex; gap:10px; margin-bottom:20px; align-items:flex-start; }

  .feature-pill { display:inline-flex; align-items:center; gap:6px; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.18); border-radius:99px; padding:5px 12px; font-size:12px; color:#a5b4fc; font-weight:500; }

  .left-panel { flex:1; display:flex; flex-direction:column; justify-content:center; padding:60px 64px; position:relative; }
  @media (max-width:900px) { .left-panel { display:none; } }

  @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .float-1 { animation:floatUp 5s ease-in-out infinite; }
  .float-2 { animation:floatUp 5s ease-in-out infinite; animation-delay:-2.5s; }

  .right-panel { width:480px; min-height:100vh; display:flex; flex-direction:column; justify-content:center; padding:48px 44px; position:relative; z-index:2; background:rgba(8,8,16,0.6); border-left:1px solid rgba(99,102,241,0.08); backdrop-filter:blur(20px); }
  @media (max-width:900px) { .right-panel { width:100%; border-left:none; padding:40px 24px; } }
`;

const fadeUp = {
  hidden: { opacity:0, y:20 },
  visible: (i=0) => ({ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1], delay:i*0.07 } }),
};
const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } };

export default function MeetraAuthPage() {
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginData, setLoginData] = useState({ email:"", password:"" });
  const [signupData, setSignupData] = useState({ name:"", email:"", password:"", dateOfBirth:"", gender:"male", bio:"", interests:"" });

  const { login } = useAuth();
  const navigate = useNavigate();

  const switchMode = (m) => { setError(""); setIsRateLimited(false); setMode(m); };
  const isLogin = mode === "login";

  const handleAuthError = (err) => {
    if (err.response?.status === 429) {
      setIsRateLimited(true);
      setError(err.response?.data?.message || "Too many attempts, please try again after 15 minutes");
    } else {
      setIsRateLimited(false);
      setError(err.response?.data?.message || (isLogin ? "Login failed. Please try again." : "Signup failed. Please try again."));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setIsRateLimited(false); setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email:loginData.email, password:loginData.password });
      login(data.user, data.token); navigate("/dashboard");
    } catch(err) { handleAuthError(err); }
    finally { setIsLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setError(""); setIsRateLimited(false); setIsLoading(true);
    try {
      const payload = { name:signupData.name, email:signupData.email, password:signupData.password, dateOfBirth:signupData.dateOfBirth, gender:signupData.gender };
      if(signupData.bio) payload.bio = signupData.bio;
      if(signupData.interests) payload.interests = signupData.interests;
      const { data } = await api.post("/auth/register", payload);
      login(data.user, data.token); navigate("/dashboard");
    } catch(err) { handleAuthError(err); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-noise auth-grid" style={{ background:"var(--bg)", minHeight:"100vh", display:"flex", overflow:"hidden", position:"relative" }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} style={{ marginBottom:12 }}>
              <span style={{ fontFamily:"var(--sora)",fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6366f1" }}>AI Meeting Intelligence</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} style={{ fontFamily:"var(--sora)",fontSize:"clamp(36px,4vw,54px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.02em",color:"#fff",marginBottom:20 }}>
              Meetings that<br/><span className="gt">actually matter.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} style={{ fontSize:16,color:"var(--muted2)",lineHeight:1.75,maxWidth:400,marginBottom:36 }}>
              Meetra listens, understands, and transforms every meeting into structured insights your team can act on — instantly.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:48 }}>
              {["Smart Summaries","Action Items","Health Score","PDF Export"].map((f,i)=>(
                <span key={i} className="feature-pill">
                  <span style={{ width:5,height:5,borderRadius:"50%",background:"#6366f1",display:"inline-block" }}/>
                  {f}
                </span>
              ))}
            </motion.div>

            {/* Floating cards */}
            <motion.div variants={fadeUp} custom={4} style={{ display:"flex",flexDirection:"column",gap:12,maxWidth:380 }}>
              <div className="float-1" style={{ background:"rgba(8,8,16,0.85)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:14,padding:"16px 20px",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:40,height:40,borderRadius:10,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🧠</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--sora)",fontSize:13,fontWeight:600,color:"#fff",marginBottom:2 }}>AI analyzed your meeting</div>
                  <div style={{ fontSize:12,color:"var(--muted)" }}>6 action items · Health score 94/100</div>
                </div>
                <div style={{ fontFamily:"var(--sora)",fontSize:20,fontWeight:800,flexShrink:0 }} className="gt">94</div>
              </div>
              <div className="float-2" style={{ background:"rgba(8,8,16,0.85)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:14,padding:"16px 20px",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:40,height:40,borderRadius:10,background:"rgba(139,92,246,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📄</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--sora)",fontSize:13,fontWeight:600,color:"#fff",marginBottom:2 }}>Report ready to download</div>
                  <div style={{ fontSize:12,color:"var(--muted)" }}>meetra-report-q3.pdf</div>
                </div>
                <div style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:7,padding:"5px 12px",fontSize:11,fontWeight:700,fontFamily:"var(--sora)",color:"#fff",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>Download</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">

          {/* Logo */}
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.1}} style={{ marginBottom:32 }}>
            <Link to="/" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none",marginBottom:12 }}>
              <div style={{ width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--sora)",fontWeight:800,fontSize:17,color:"#fff",boxShadow:"0 0 24px rgba(99,102,241,0.4)" }}>M</div>
              <span style={{ fontFamily:"var(--sora)",fontWeight:700,fontSize:19,color:"#fff" }}>Meetra</span>
            </Link>
            <div style={{ fontFamily:"var(--sora)",fontSize:22,fontWeight:700,color:"#fff",marginBottom:4 }}>
              {isLogin ? "Welcome back" : "Create your account"}
            </div>
            <div style={{ fontSize:14,color:"var(--muted)" }}>
              {isLogin ? "Sign in to your workspace" : "Start turning meetings into clarity"}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn ${isLogin?"active":""}`} onClick={()=>switchMode("login")}>Sign in</button>
            <button className={`tab-btn ${!isLogin?"active":""}`} onClick={()=>switchMode("register")}>Create account</button>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity:0, x:isLogin?-16:16 }}
              animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:isLogin?16:-16 }}
              transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    style={{
                      background: isRateLimited ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${isRateLimited ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.2)"}`,
                      borderRadius:11, padding:"12px 14px", display:"flex", gap:10, marginBottom:20, alignItems:"flex-start",
                    }}
                  >
                    <AlertCircle size={16} style={{color: isRateLimited ? "#fbbf24" : "#f87171", flexShrink:0, marginTop:1}}/>
                    <div>
                      <span style={{fontSize:13, color: isRateLimited ? "#fbbf24" : "#f87171"}}>{error}</span>
                      {isRateLimited && (
                        <div style={{fontSize:11,color:"rgba(251,191,36,0.6)",marginTop:4}}>
                          Please wait before trying again.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={isLogin ? handleLogin : handleSignup}>

                {!isLogin && (
                  <>
                    <div className="field-wrap">
                      <label className="field-label">Full name</label>
                      <div style={{position:"relative"}}>
                        <input className="field-input" type="text" placeholder="John Smith" required
                          value={signupData.name} onChange={e=>setSignupData({...signupData,name:e.target.value})}/>
                        <span className="field-icon"><User size={15}/></span>
                      </div>
                    </div>

                    <div className="two-col">
                      <div className="field-wrap">
                        <label className="field-label">Date of birth</label>
                        <div style={{position:"relative"}}>
                          <input className="field-input" type="date" required
                            value={signupData.dateOfBirth} onChange={e=>setSignupData({...signupData,dateOfBirth:e.target.value})}/>
                          <span className="field-icon"><Calendar size={15}/></span>
                        </div>
                      </div>
                      <div className="field-wrap">
                        <label className="field-label">Gender</label>
                        <select className="field-bare" value={signupData.gender} onChange={e=>setSignupData({...signupData,gender:e.target.value})}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="field-wrap">
                      <label className="field-label">Bio <span style={{color:"var(--muted)",textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:11}}>(optional)</span></label>
                      <textarea className="field-textarea" placeholder="Tell us about yourself..."
                        value={signupData.bio} onChange={e=>setSignupData({...signupData,bio:e.target.value})}/>
                    </div>

                    <div className="field-wrap">
                      <label className="field-label">Interests <span style={{color:"var(--muted)",textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:11}}>(optional)</span></label>
                      <input className="field-bare" type="text" placeholder="e.g. AI, Business, Tech"
                        value={signupData.interests} onChange={e=>setSignupData({...signupData,interests:e.target.value})}/>
                    </div>
                  </>
                )}

                <div className="field-wrap">
                  <label className="field-label">Email address</label>
                  <div style={{position:"relative"}}>
                    <input className="field-input" type="email" placeholder="you@company.com" required
                      value={isLogin?loginData.email:signupData.email}
                      onChange={e=>isLogin?setLoginData({...loginData,email:e.target.value}):setSignupData({...signupData,email:e.target.value})}/>
                    <span className="field-icon"><Mail size={15}/></span>
                  </div>
                </div>

                <div className="field-wrap" style={{marginBottom:24}}>
                  <label className="field-label">Password</label>
                  <div style={{position:"relative"}}>
                    <input className="field-input" style={{paddingRight:44}} type={showPass?"text":"password"} placeholder="••••••••" required
                      value={isLogin?loginData.password:signupData.password}
                      onChange={e=>isLogin?setLoginData({...loginData,password:e.target.value}):setSignupData({...signupData,password:e.target.value})}/>
                    <span className="field-icon"><Lock size={15}/></span>
                    <button type="button" className="eye-btn" onClick={()=>setShowPass(!showPass)}>
                      {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading || isRateLimited}>
                  {isLoading
                    ? <><div className="spin"/>{isLogin?"Signing in...":"Creating account..."}</>
                    : isLogin?"Sign in to Meetra →":"Create account →"
                  }
                </button>
              </form>

              <div style={{marginTop:20,textAlign:"center"}}>
                <p style={{fontSize:12,color:"var(--muted)"}}>
                  By continuing you agree to Meetra's{" "}
                  <a href="#" style={{color:"#818cf8",textDecoration:"none"}}>Terms</a> &{" "}
                  <a href="#" style={{color:"#818cf8",textDecoration:"none"}}>Privacy Policy</a>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Back link */}
          <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:"var(--muted)",textDecoration:"none",transition:"color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.color="var(--muted2)"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}>
              <ArrowLeft size={13}/> Back to Meetra
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}