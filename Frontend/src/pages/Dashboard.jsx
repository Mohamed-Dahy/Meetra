import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import {
  FileText, CheckSquare, TrendingUp, Upload, Clock,
  LogOut, Bell, Settings, ChevronRight, Plus, Zap,
  BarChart2, Users, ArrowUpRight
} from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:       #04040c;
    --bg-card:  #08080f;
    --bg-card2: #0c0c18;
    --accent:   #6366f1;
    --accent2:  #8b5cf6;
    --accent3:  #06b6d4;
    --border:   rgba(99,102,241,0.14);
    --border-hi:rgba(99,102,241,0.5);
    --text:     #f1f5f9;
    --muted:    #475569;
    --muted2:   #94a3b8;
    --sora:     'Sora', sans-serif;
    --dm:       'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }

  /* noise */
  .dash-noise::after {
    content:''; position:fixed; inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:.022; pointer-events:none; z-index:9999;
  }

  .dash-grid {
    background-image:
      linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
    background-size: 56px 56px;
  }

  /* sidebar */
  .sidebar {
    position: fixed; left:0; top:0; bottom:0; width:240px;
    background: rgba(8,8,15,0.95);
    border-right: 1px solid rgba(99,102,241,0.1);
    backdrop-filter: blur(24px);
    display: flex; flex-direction: column;
    padding: 24px 16px;
    z-index: 50;
  }

  .nav-item {
    display: flex; align-items: center; gap:12px;
    padding: 10px 14px; border-radius: 10px;
    color: var(--muted2); font-size: 14px; font-weight: 500;
    font-family: var(--dm); cursor: pointer;
    transition: all 0.2s; border: none; background: none;
    width: 100%; text-align: left;
  }
  .nav-item:hover { background: rgba(99,102,241,0.08); color: var(--text); }
  .nav-item.active {
    background: rgba(99,102,241,0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99,102,241,0.25);
  }

  /* stat card */
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    position: relative; overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .stat-card:hover {
    border-color: var(--border-hi);
    box-shadow: 0 0 30px rgba(99,102,241,0.08);
  }
  .stat-card::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(circle at 100% 0%, rgba(99,102,241,0.07), transparent 60%);
  }

  /* meeting row */
  .meeting-row {
    display: flex; align-items: center; gap:16px;
    padding: 16px 20px; border-radius: 12px;
    border: 1px solid transparent;
    transition: all 0.2s; cursor: pointer;
    background: rgba(255,255,255,0.015);
  }
  .meeting-row:hover {
    background: rgba(99,102,241,0.06);
    border-color: rgba(99,102,241,0.2);
  }

  /* upload zone */
  .upload-zone {
    border: 2px dashed rgba(99,102,241,0.3);
    border-radius: 16px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(99,102,241,0.03);
  }
  .upload-zone:hover {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.07);
  }

  /* gt */
  .gt {
    background: linear-gradient(135deg, #818cf8, #a78bfa, #67e8f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* glow btn */
  .btn-glow {
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    color:#fff; border:none; border-radius:10px;
    padding:10px 20px; font-family:var(--sora);
    font-size:13px; font-weight:600; cursor:pointer;
    display:inline-flex; align-items:center; gap:8px;
    transition: all 0.2s;
    box-shadow: 0 0 24px rgba(99,102,241,0.3);
    text-decoration: none;
  }
  .btn-glow:hover { transform:translateY(-2px); box-shadow:0 0 40px rgba(99,102,241,0.5); }

  /* health bar */
  .health-bar {
    height: 6px; border-radius: 99px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }

  /* badge */
  .badge {
    display:inline-flex; align-items:center;
    padding:3px 10px; border-radius:99px;
    font-size:11px; font-weight:600;
    font-family:var(--sora);
  }
  .badge-green { background:rgba(34,197,94,0.12); color:#4ade80; border:1px solid rgba(34,197,94,0.2); }
  .badge-blue  { background:rgba(99,102,241,0.12); color:#818cf8; border:1px solid rgba(99,102,241,0.2); }
  .badge-amber { background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.2); }

  /* topbar */
  .topbar {
    position:fixed; top:0; left:240px; right:0; height:64px;
    background:rgba(4,4,12,0.85); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(99,102,241,0.08);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 32px; z-index:40;
  }

  /* avatar */
  .avatar {
    width:36px; height:36px; border-radius:10px;
    background:linear-gradient(135deg,#6366f1,#8b5cf6);
    display:flex; align-items:center; justify-content:center;
    font-family:var(--sora); font-weight:700; font-size:14px; color:#fff;
  }

  /* section card */
  .section-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
  }
  .section-title {
    font-family: var(--sora); font-size:16px; font-weight:700;
    color:#fff; margin-bottom:20px;
    display:flex; align-items:center; justify-content:space-between;
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.8s infinite;
    border-radius: 8px;
  }

  @keyframes pulse-ring {
    0%   { transform:scale(1); opacity:1; }
    100% { transform:scale(2.2); opacity:0; }
  }
  .live-dot { position:relative; display:inline-flex; }
  .live-dot::before {
    content:''; position:absolute; inset:0; border-radius:50%;
    background:#22c55e; animation:pulse-ring 1.5s ease-out infinite;
  }
`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i=0) => ({ opacity:1, y:0, transition:{ duration:0.6, ease:[0.22,1,0.36,1], delay:i*0.08 } }),
};

const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:0.09 } } };

const MEETINGS = [
  { id:1, title:"Q3 Budget Review",      date:"Feb 28, 2026", duration:"52 min", score:94, sentiment:"positive",  status:"completed" },
  { id:2, title:"Product Roadmap Sync",  date:"Feb 25, 2026", duration:"38 min", score:71, sentiment:"neutral",   status:"completed" },
  { id:3, title:"Marketing Strategy",    date:"Feb 22, 2026", duration:"61 min", score:58, sentiment:"neutral",   status:"completed" },
  { id:4, title:"Engineering Standup",   date:"Feb 20, 2026", duration:"14 min", score:88, sentiment:"positive",  status:"completed" },
];

const ACTIONS = [
  { task:"Prepare Q3 budget report",     owner:"Sarah",  due:"Mar 5",  done:false },
  { task:"Schedule follow-up meeting",   owner:"John",   due:"Mar 3",  done:true  },
  { task:"Review marketing proposals",   owner:"Ahmed",  due:"Mar 7",  done:false },
  { task:"Update product roadmap doc",   owner:"Layla",  due:"Mar 10", done:false },
];

function ScoreBar({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="health-bar" style={{ width:80 }}>
      <motion.div initial={{ width:0 }} animate={{ width:`${score}%` }}
        transition={{ duration:0.9, ease:"easeOut" }}
        style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${color}88,${color})` }} />
    </div>
  );
}

function SentimentBadge({ s }) {
  if (s==="positive") return <span className="badge badge-green">Positive</span>;
  if (s==="negative") return <span className="badge" style={{background:"rgba(239,68,68,0.12)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}>Negative</span>;
  return <span className="badge badge-amber">Neutral</span>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("overview");
  const [dragOver, setDragOver] = useState(false);

  const initials = (user?.name || "U").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);

  const NAV = [
    { id:"overview",  label:"Overview",   icon:<BarChart2 size={16}/> },
    { id:"meetings",  label:"Meetings",   icon:<FileText  size={16}/> },
    { id:"actions",   label:"Action Items",icon:<CheckSquare size={16}/> },
    { id:"analytics", label:"Analytics",  icon:<TrendingUp size={16}/> },
    { id:"team",      label:"Team",       icon:<Users     size={16}/> },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-noise" style={{ background:"var(--bg)", minHeight:"100vh", fontFamily:"var(--dm)" }}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"4px 10px 28px" }}>
            <div style={{ width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--sora)",fontWeight:700,fontSize:15,color:"#fff",boxShadow:"0 0 20px rgba(99,102,241,0.35)" }}>M</div>
            <span style={{ fontFamily:"var(--sora)",fontWeight:700,fontSize:17,color:"#fff" }}>Meetra</span>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
            {NAV.map(n => (
              <button key={n.id} className={`nav-item ${activeNav===n.id?"active":""}`} onClick={()=>setActiveNav(n.id)}>
                {n.icon} {n.label}
              </button>
            ))}
          </nav>

          {/* User area */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:16, display:"flex", flexDirection:"column", gap:4 }}>
            <button className="nav-item"><Settings size={15}/> Settings</button>
            <button className="nav-item" onClick={logout}><LogOut size={15}/> Sign out</button>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginTop:8, background:"rgba(99,102,241,0.07)", borderRadius:10, border:"1px solid rgba(99,102,241,0.12)" }}>
              <div className="avatar">{initials}</div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:13,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.name||"User"}</div>
                <div style={{ fontSize:11,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.email||""}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div>
            <div style={{ fontFamily:"var(--sora)",fontWeight:700,fontSize:18,color:"#fff" }}>
              Good morning, {user?.name?.split(" ")[0] || "there"} 👋
            </div>
            <div style={{ fontSize:12,color:"var(--muted)",marginTop:1 }}>Monday, March 2 · 4 meetings this week</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button className="btn-glow"><Plus size={14}/> New Meeting</button>
            <button style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted2)",transition:"all 0.2s",position:"relative" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(99,102,241,0.4)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
              <Bell size={15}/>
              <div style={{ position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:"#6366f1",border:"1.5px solid var(--bg)" }}/>
            </button>
            <div className="avatar" style={{ cursor:"pointer" }}>{initials}</div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className="dash-grid" style={{ marginLeft:240, paddingTop:96, padding:"96px 32px 48px 272px", minHeight:"100vh" }}>

          <AnimatePresence mode="wait">
            <motion.div key={activeNav} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>

              {/* ════ OVERVIEW ════ */}
              {activeNav==="overview" && (
                <motion.div variants={stagger} initial="hidden" animate="visible">

                  {/* Stats row */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
                    {[
                      { label:"Total Meetings",   val:"12",  delta:"+3 this week",  icon:<FileText size={18}/>,  color:"#6366f1" },
                      { label:"Action Items",      val:"28",  delta:"8 pending",     icon:<CheckSquare size={18}/>,color:"#8b5cf6" },
                      { label:"Avg Health Score",  val:"76",  delta:"+4 vs last week",icon:<TrendingUp size={18}/>,color:"#06b6d4" },
                      { label:"Hours Saved",       val:"14h", delta:"this month",    icon:<Zap size={18}/>,       color:"#f59e0b" },
                    ].map((s,i)=>(
                      <motion.div key={i} variants={fadeUp} custom={i} className="stat-card">
                        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16 }}>
                          <div style={{ width:40,height:40,borderRadius:12,background:`${s.color}18`,border:`1px solid ${s.color}28`,display:"flex",alignItems:"center",justifyContent:"center",color:s.color }}>
                            {s.icon}
                          </div>
                          <ArrowUpRight size={14} style={{ color:"var(--muted)",marginTop:4 }}/>
                        </div>
                        <div style={{ fontFamily:"var(--sora)",fontSize:28,fontWeight:800,color:"#fff",marginBottom:4 }} className="gt">{s.val}</div>
                        <div style={{ fontSize:12,color:"var(--muted)",marginBottom:4 }}>{s.label}</div>
                        <div style={{ fontSize:11,color:s.color,fontWeight:500 }}>{s.delta}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Two columns */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20, marginBottom:20 }}>

                    {/* Recent meetings */}
                    <motion.div variants={fadeUp} custom={4} className="section-card">
                      <div className="section-title">
                        Recent Meetings
                        <button style={{ fontSize:12,color:"#818cf8",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4 }} onClick={()=>setActiveNav("meetings")}>
                          View all <ChevronRight size={12}/>
                        </button>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                        {MEETINGS.slice(0,3).map((m,i)=>(
                          <div key={i} className="meeting-row">
                            <div style={{ width:36,height:36,borderRadius:10,background:"rgba(99,102,241,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                              <FileText size={15} style={{ color:"#818cf8" }}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:14,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{m.title}</div>
                              <div style={{ fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
                                <Clock size={10}/>{m.date} · {m.duration}
                              </div>
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
                              <ScoreBar score={m.score}/>
                              <span style={{ fontFamily:"var(--sora)",fontSize:13,fontWeight:700,color:"#fff",minWidth:28,textAlign:"right" }}>{m.score}</span>
                              <SentimentBadge s={m.sentiment}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Pending actions */}
                    <motion.div variants={fadeUp} custom={5} className="section-card">
                      <div className="section-title">
                        Pending Actions
                        <span className="badge badge-blue">{ACTIONS.filter(a=>!a.done).length} open</span>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                        {ACTIONS.map((a,i)=>(
                          <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:i<ACTIONS.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                            <div style={{ width:18,height:18,borderRadius:5,border:`2px solid ${a.done?"#6366f1":"rgba(99,102,241,0.35)"}`,background:a.done?"#6366f1":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:"pointer" }}>
                              {a.done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13,color:a.done?"var(--muted)":"var(--text)",fontWeight:500,textDecoration:a.done?"line-through":"none" }}>{a.task}</div>
                              <div style={{ fontSize:11,color:"var(--muted)",marginTop:3,display:"flex",gap:8 }}>
                                <span>@{a.owner}</span><span>·</span><span>Due {a.due}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Upload zone */}
                  <motion.div variants={fadeUp} custom={6}
                    className="upload-zone"
                    onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={e=>{e.preventDefault();setDragOver(false)}}
                    style={{ borderColor:dragOver?"rgba(99,102,241,0.7)":"rgba(99,102,241,0.3)", background:dragOver?"rgba(99,102,241,0.1)":"rgba(99,102,241,0.03)" }}>
                    <div style={{ width:52,height:52,borderRadius:16,background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"#818cf8" }}>
                      <Upload size={22}/>
                    </div>
                    <div style={{ fontFamily:"var(--sora)",fontSize:16,fontWeight:600,color:"#fff",marginBottom:8 }}>Upload a meeting recording</div>
                    <div style={{ fontSize:13,color:"var(--muted)",marginBottom:20 }}>Drag & drop your audio file or paste a transcript below</div>
                    <button className="btn-glow"><Plus size={14}/> Upload meeting</button>
                  </motion.div>
                </motion.div>
              )}

              {/* ════ MEETINGS ════ */}
              {activeNav==="meetings" && (
                <motion.div variants={stagger} initial="hidden" animate="visible">
                  <motion.div variants={fadeUp} style={{ marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <h1 style={{ fontFamily:"var(--sora)",fontSize:26,fontWeight:700,color:"#fff",marginBottom:4 }}>Meetings</h1>
                      <p style={{ fontSize:14,color:"var(--muted)" }}>All your analyzed meetings in one place</p>
                    </div>
                    <button className="btn-glow"><Plus size={14}/> New Meeting</button>
                  </motion.div>

                  <motion.div variants={fadeUp} custom={1} className="section-card">
                    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                      {MEETINGS.map((m,i)=>(
                        <div key={i} className="meeting-row" style={{ padding:"18px 20px" }}>
                          <div style={{ width:42,height:42,borderRadius:12,background:"rgba(99,102,241,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <FileText size={17} style={{ color:"#818cf8" }}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:4 }}>{m.title}</div>
                            <div style={{ fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:8 }}>
                              <Clock size={11}/>{m.date} · {m.duration}
                            </div>
                          </div>
                          <div style={{ display:"flex",alignItems:"center",gap:16,flexShrink:0 }}>
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontFamily:"var(--sora)",fontSize:20,fontWeight:800 }} className="gt">{m.score}</div>
                              <div style={{ fontSize:10,color:"var(--muted)" }}>score</div>
                            </div>
                            <SentimentBadge s={m.sentiment}/>
                            <span className="badge badge-green">Completed</span>
                            <button style={{ background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,color:"#818cf8",padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--sora)",transition:"all 0.2s",display:"flex",alignItems:"center",gap:6 }}>
                              View <ChevronRight size={12}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ════ ACTION ITEMS ════ */}
              {activeNav==="actions" && (
                <motion.div variants={stagger} initial="hidden" animate="visible">
                  <motion.div variants={fadeUp} style={{ marginBottom:24 }}>
                    <h1 style={{ fontFamily:"var(--sora)",fontSize:26,fontWeight:700,color:"#fff",marginBottom:4 }}>Action Items</h1>
                    <p style={{ fontSize:14,color:"var(--muted)" }}>Track tasks extracted from your meetings</p>
                  </motion.div>

                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24 }}>
                    {[
                      {label:"Total",val:ACTIONS.length,color:"#6366f1"},
                      {label:"Completed",val:ACTIONS.filter(a=>a.done).length,color:"#22c55e"},
                      {label:"Pending",val:ACTIONS.filter(a=>!a.done).length,color:"#f59e0b"},
                    ].map((s,i)=>(
                      <motion.div key={i} variants={fadeUp} custom={i} className="stat-card" style={{ textAlign:"center",padding:28 }}>
                        <div style={{ fontFamily:"var(--sora)",fontSize:36,fontWeight:800,marginBottom:6 }} className="gt">{s.val}</div>
                        <div style={{ fontSize:13,color:"var(--muted)" }}>{s.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div variants={fadeUp} custom={3} className="section-card">
                    {ACTIONS.map((a,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:16,padding:"18px 0",borderBottom:i<ACTIONS.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                        <div style={{ width:22,height:22,borderRadius:6,border:`2px solid ${a.done?"#6366f1":"rgba(99,102,241,0.35)"}`,background:a.done?"#6366f1":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer" }}>
                          {a.done&&<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14,fontWeight:600,color:a.done?"var(--muted)":"var(--text)",textDecoration:a.done?"line-through":"none",marginBottom:4 }}>{a.task}</div>
                          <div style={{ fontSize:12,color:"var(--muted)",display:"flex",gap:8 }}>
                            <span>Assigned to @{a.owner}</span><span>·</span><span>Due {a.due}</span>
                          </div>
                        </div>
                        {a.done
                          ? <span className="badge badge-green">Done</span>
                          : <span className="badge badge-amber">Pending</span>
                        }
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* ════ ANALYTICS / TEAM placeholders ════ */}
              {(activeNav==="analytics"||activeNav==="team") && (
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center" }}>
                  <div style={{ width:72,height:72,borderRadius:20,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,color:"#818cf8" }}>
                    {activeNav==="analytics"?<TrendingUp size={30}/>:<Users size={30}/>}
                  </div>
                  <h2 style={{ fontFamily:"var(--sora)",fontSize:24,fontWeight:700,color:"#fff",marginBottom:12 }}>
                    {activeNav==="analytics"?"Analytics":"Team"} coming soon
                  </h2>
                  <p style={{ fontSize:15,color:"var(--muted)",maxWidth:400,lineHeight:1.7 }}>
                    {activeNav==="analytics"
                      ?"Deep insights into your meeting patterns, productivity trends, and team performance."
                      :"Invite teammates, manage roles, and see meeting activity across your entire organization."}
                  </p>
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}