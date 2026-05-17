import { useState } from "react";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API = "https://molasses-squint-finlike.ngrok-free.dev/nyayasetu-api/auth";

const api = {
  getToken:    ()  => localStorage.getItem("nyaya_token"),
  setToken:    (t) => localStorage.setItem("nyaya_token", t),
  clearToken:  ()  => localStorage.removeItem("nyaya_token"),
  setSession:  (s) => localStorage.setItem("nyaya_session", JSON.stringify(s)),
  clearSession:()  => localStorage.removeItem("nyaya_session"),

  async post(endpoint, body) {
    const res = await fetch(`${API}/${endpoint}.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",   // ← add this
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async get(endpoint) {
    const token = api.getToken();
    const res = await fetch(`${API}/${endpoint}.php`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",   // ← add this
      },
    });
    return res.json();
  },
};

// ─── VALIDATORS ───────────────────────────────────────────────────────────────
const validate = {
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address",
  name:     (v) => v.trim().length >= 2 ? "" : "Name must be at least 2 characters",
  password: (v) => {
    if (v.length < 8)          return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(v))      return "Must include at least one uppercase letter";
    if (!/[0-9]/.test(v))      return "Must include at least one number";
    return "";
  },
  confirm: (p, c) => p === c ? "" : "Passwords do not match",
};

const PASSWORD_STRENGTH = (p) => {
  let s = 0;
  if (p.length >= 8)          s++;
  if (p.length >= 12)         s++;
  if (/[A-Z]/.test(p))        s++;
  if (/[0-9]/.test(p))        s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Eye  = ({ show }) => show
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

const ChkY = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const ChkN = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const ScaleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 3v18"/><path d="M3 9l9-6 9 6"/>
    <path d="M5 16H3a1 1 0 01-1-1v-1l3-6 3 6v1a1 1 0 01-1 1H5z"/>
    <path d="M19 16h-2a1 1 0 01-1-1v-1l3-6 3 6v1a1 1 0 01-1 1H19z"/>
  </svg>
);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const AUTH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .auth-root *, .auth-root *::before, .auth-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .auth-root {
    --gold: #c8a96e; --gold-l: #e2c48a; --gold-d: #9a7a40; --gold-dim: rgba(200,169,110,0.12);
    --ink: #0c0b09; --ink2: #141210; --ink3: #1c1916;
    --sf: rgba(255,255,255,0.035); --sf2: rgba(255,255,255,0.06); --sf3: rgba(255,255,255,0.09);
    --bd: rgba(200,169,110,0.18); --bd2: rgba(255,255,255,0.08);
    --t1: #f0ebe0; --t2: rgba(240,235,224,0.58); --t3: rgba(240,235,224,0.3);
    --red: #ef4444; --green: #10b981; --blue: #3b82f6;
    --r: 14px; --r2: 10px;
    min-height: 100vh; font-family: 'DM Sans', sans-serif; background: var(--ink); color: var(--t1);
  }
  .auth-root button, .auth-root input, .auth-root select { font-family: 'DM Sans', sans-serif; }

  /* LAYOUT */
  .auth-wrap { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
  @media (max-width: 860px) { .auth-wrap { grid-template-columns: 1fr; } .auth-left { display: none; } }

  /* LEFT PANEL */
  .auth-left {
    background: var(--ink2); border-right: 1px solid var(--bd);
    display: flex; flex-direction: column; justify-content: space-between; padding: 48px;
    position: relative; overflow: hidden;
  }
  .auth-left::before {
    content:''; position:absolute; inset:0;
    background: radial-gradient(ellipse at 30% 20%, rgba(200,169,110,0.09) 0%, transparent 55%),
                radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.05) 0%, transparent 50%);
  }
  .auth-left-bg-scale {
    position:absolute; right:-80px; top:50%; transform:translateY(-50%);
    width:420px; height:420px; opacity:0.03; pointer-events:none;
  }
  .al-brand { display:flex; align-items:center; gap:12px; margin-bottom:64px; position:relative; z-index:1; }
  .al-logo {
    width:44px; height:44px; border-radius:12px;
    background:linear-gradient(135deg,var(--gold),var(--gold-d));
    display:flex; align-items:center; justify-content:center; color:#1a1208;
    box-shadow:0 4px 16px rgba(200,169,110,0.3);
  }
  .al-name { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; }
  .al-sub  { font-size:11px; color:var(--t3); letter-spacing:0.08em; }
  .al-content { position:relative; z-index:1; }
  .al-headline { font-family:'Cormorant Garamond',serif; font-size:clamp(30px,3vw,44px); font-weight:600; line-height:1.12; margin-bottom:18px; }
  .al-headline em { color:var(--gold); font-style:italic; }
  .al-desc { font-size:15px; color:var(--t2); line-height:1.75; font-weight:300; max-width:380px; margin-bottom:40px; }
  .al-features { display:flex; flex-direction:column; gap:14px; }
  .al-feat { display:flex; align-items:flex-start; gap:14px; padding:14px 16px; border-radius:var(--r); background:var(--sf); border:1px solid var(--bd); }
  .al-feat-icon { width:34px; height:34px; border-radius:9px; flex-shrink:0; background:var(--gold-dim); border:1px solid rgba(200,169,110,0.25); display:flex; align-items:center; justify-content:center; font-size:16px; }
  .al-feat-title { font-size:13px; font-weight:600; color:var(--t1); margin-bottom:2px; }
  .al-feat-desc  { font-size:11px; color:var(--t2); line-height:1.5; }
  .al-bottom { position:relative; z-index:1; display:flex; gap:8px; flex-wrap:wrap; }
  .al-badge { display:flex; align-items:center; gap:5px; padding:5px 11px; border-radius:20px; font-size:11px; background:var(--sf); border:1px solid var(--bd2); color:var(--t2); }
  .al-badge span { color:var(--gold); }

  /* RIGHT PANEL */
  .auth-right {
    display:flex; flex-direction:column; justify-content:center; align-items:center;
    padding:48px 36px; background:var(--ink); overflow-y:auto; position:relative;
  }
  .auth-right::before { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 80% 10%, rgba(200,169,110,0.05) 0%, transparent 50%); }
  .auth-form-shell { width:100%; max-width:420px; position:relative; z-index:1; animation:authSlideUp 0.4s ease; }

  /* Mobile logo */
  .auth-mobile-logo { display:none; align-items:center; gap:10px; margin-bottom:28px; }
  @media(max-width:860px){ .auth-mobile-logo{ display:flex; } }
  .auth-mobile-logo .ml-logo { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,var(--gold),var(--gold-d)); display:flex; align-items:center; justify-content:center; color:#1a1208; }
  .auth-mobile-logo .ml-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:700; }
  .auth-mobile-logo .ml-sub  { font-size:10px; color:var(--t3); letter-spacing:0.07em; }

  /* FORM HEAD */
  .f-head { margin-bottom:24px; }
  .f-title { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:700; margin-bottom:5px; }
  .f-sub   { font-size:14px; color:var(--t2); font-weight:300; }

  /* FIELDS */
  .fg      { margin-bottom:15px; }
  .flabel  { display:block; font-size:11px; font-weight:600; color:var(--t3); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px; }
  .fi-wrap { position:relative; }
  .fi-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--t3); pointer-events:none; display:flex; }
  .fi-eye  { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--t3); background:none; border:none; padding:3px; cursor:pointer; display:flex; transition:color .15s; }
  .fi-eye:hover { color:var(--gold); }
  .finput  {
    width:100%; padding:11px 14px 11px 42px; border-radius:var(--r2);
    background:var(--sf); border:1px solid var(--bd2); color:var(--t1);
    font-size:14px; outline:none; transition:border-color .15s, background .15s, box-shadow .15s;
  }
  .finput.no-icon { padding-left:14px; }
  .finput:focus { border-color:var(--gold); background:rgba(200,169,110,0.05); box-shadow:0 0 0 3px rgba(200,169,110,0.1); }
  .finput.err   { border-color:var(--red)!important; box-shadow:0 0 0 3px rgba(239,68,68,0.1); }
  .finput::placeholder { color:var(--t3); }
  .f-err { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--red); margin-top:5px; }
  .f-ok  { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--green); margin-top:5px; }

  /* 2-col row */
  .row-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:480px){ .row-2{ grid-template-columns:1fr; } }

  /* STRENGTH */
  .str-bars { display:flex; gap:4px; margin:7px 0 3px; }
  .str-bar  { flex:1; height:3px; border-radius:2px; background:var(--sf2); transition:background .3s; }
  .str-lbl  { font-size:11px; }

  /* ROLE SELECTOR */
  .role-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:15px; }
  .role-card { padding:10px 6px; border-radius:var(--r2); border:1.5px solid var(--bd2); background:var(--sf); text-align:center; cursor:pointer; transition:all .15s; user-select:none; }
  .role-card.active { border-color:var(--gold); background:var(--gold-dim); }
  .role-card:hover:not(.active){ border-color:rgba(200,169,110,0.3); }
  .role-icon  { font-size:20px; margin-bottom:4px; }
  .role-lbl   { font-size:11px; font-weight:600; color:var(--t1); display:block; }
  .role-sub   { font-size:10px; color:var(--t3); display:block; }

  /* CHECKBOX */
  .chk-row  { display:flex; align-items:flex-start; gap:9px; margin-bottom:18px; cursor:pointer; }
  .chk-box  { width:18px; height:18px; border-radius:4px; border:1.5px solid var(--bd2); display:flex; align-items:center; justify-content:center; flex-shrink:0; background:var(--sf); margin-top:1px; transition:all .15s; }
  .chk-box.on  { background:var(--gold); border-color:var(--gold); color:#1a1208; }
  .chk-box.err { border-color:var(--red); }
  .chk-txt  { font-size:12px; color:var(--t2); line-height:1.6; }
  .chk-txt a { color:var(--gold); text-decoration:none; }

  /* GENERAL ERROR */
  .g-err { padding:11px 14px; border-radius:var(--r2); margin-bottom:14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); font-size:13px; color:#fca5a5; display:flex; gap:8px; align-items:flex-start; }

  /* SERVER STATUS */
  .srv-warn { padding:10px 13px; border-radius:8px; margin-bottom:14px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); font-size:12px; color:#fcd34d; display:flex; gap:7px; align-items:center; }

  /* SUBMIT */
  .sub-btn {
    width:100%; padding:13px 24px; border-radius:var(--r2); border:none;
    background:linear-gradient(135deg,var(--gold),var(--gold-d));
    font-size:15px; font-weight:700; font-family:'Cormorant Garamond',serif;
    color:#1a1208; letter-spacing:0.02em; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:all .2s; box-shadow:0 4px 18px rgba(200,169,110,0.3);
  }
  .sub-btn:hover:not(:disabled){ background:linear-gradient(135deg,var(--gold-l),#b08840); transform:translateY(-1px); box-shadow:0 6px 24px rgba(200,169,110,0.4); }
  .sub-btn:active:not(:disabled){ transform:translateY(0); }
  .sub-btn:disabled{ opacity:.45; cursor:not-allowed; }
  .btn-spin { width:17px; height:17px; border:2px solid rgba(26,18,8,0.3); border-top-color:#1a1208; border-radius:50%; animation:authSpin .7s linear infinite; }

  /* DIVIDER */
  .divider { display:flex; align-items:center; gap:12px; margin:18px 0; }
  .div-line { flex:1; height:1px; background:var(--bd2); }
  .div-txt  { font-size:11px; color:var(--t3); }

  /* SWITCH */
  .sw-row  { text-align:center; margin-top:18px; font-size:13px; color:var(--t2); }
  .sw-link { color:var(--gold); background:none; border:none; font-size:13px; font-weight:600; cursor:pointer; text-decoration:underline; text-decoration-color:transparent; transition:text-decoration-color .15s; }
  .sw-link:hover{ text-decoration-color:var(--gold); }
  .fgt-link{ background:none; border:none; font-size:12px; color:var(--t3); cursor:pointer; transition:color .15s; }
  .fgt-link:hover{ color:var(--gold); }

  /* OTP */
  .otp-grid  { display:flex; gap:10px; justify-content:center; margin:24px 0; }
  .otp-input {
    width:50px; height:56px; border-radius:var(--r2); border:1.5px solid var(--bd2);
    background:var(--sf); color:var(--t1); font-size:22px; font-weight:700;
    text-align:center; outline:none; transition:all .15s;
  }
  .otp-input:focus { border-color:var(--gold); background:var(--gold-dim); box-shadow:0 0 0 3px rgba(200,169,110,0.15); }
  .otp-input.filled{ border-color:rgba(200,169,110,0.35); }
  .otp-hint  { text-align:center; font-size:12px; color:var(--t3); margin-bottom:6px; }

  /* TOAST */
  .auth-toast { position:fixed; bottom:22px; right:22px; z-index:9999; animation:authSlideR .3s ease; }
  .auth-toast-inner { display:flex; align-items:center; gap:9px; padding:12px 16px; border-radius:11px; font-size:13px; font-weight:500; backdrop-filter:blur(16px); box-shadow:0 8px 24px rgba(0,0,0,0.5); max-width:340px; }
  .auth-toast-inner.success { background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); color:#6ee7b7; }
  .auth-toast-inner.error   { background:rgba(239,68,68,0.15);  border:1px solid rgba(239,68,68,0.3);   color:#fca5a5; }
  .auth-toast-inner.info    { background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3);  color:#93c5fd; }

  @keyframes authSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes authSlideR  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes authSpin    { to{transform:rotate(360deg)} }
`;

// ─── MAIN AUTH COMPONENT ──────────────────────────────────────────────────────
export default function Auth({ onLogin }) {
  const [view,       setView]       = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [serverOk,   setServerOk]   = useState(true);

  // Login
  const [lEmail, setLEmail] = useState("");
  const [lPass,  setLPass]  = useState("");
  const [lShowP, setLShowP] = useState(false);
  const [lRem,   setLRem]   = useState(false);
  const [lErrs,  setLErrs]  = useState({});

  // Signup
  const [sName,  setSName]  = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sPass,  setSPass]  = useState("");
  const [sConf,  setSConf]  = useState("");
  const [sRole,  setSRole]  = useState("citizen");
  const [sShowP, setSShowP] = useState(false);
  const [sShowC, setSShowC] = useState(false);
  const [sAgree, setSAgree] = useState(false);
  const [sErrs,  setSErrs]  = useState({});

  // Forgot
  const [fEmail, setFEmail] = useState("");
  const [fSent,  setFSent]  = useState(false);

  // OTP
  const [otpVals,   setOtpVals]   = useState(["","","","","",""]);
  const [otpTarget, setOtpTarget] = useState(null);
  const [otpErr,    setOtpErr]    = useState("");
  const otpRefs = Array.from({ length: 6 }, () => ({ current: null }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!lEmail)                  errs.email = "Email is required";
    else if (validate.email(lEmail)) errs.email = validate.email(lEmail);
    if (!lPass)                   errs.pass = "Password is required";
    setLErrs(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const data = await api.post("login", { email: lEmail, password: lPass });

      if (!data.success) {
        setLErrs({ general: data.error || "Invalid email or password. Please try again." });
        setSubmitting(false);
        return;
      }

      api.setToken(data.token);
      const sess = { ...data.user, loginAt: new Date().toISOString() };
      if (lRem) api.setSession(sess);
      setServerOk(true);
      onLogin(sess);
      showToast(`Welcome back, ${data.user.name.split(" ")[0]}! 👋`);

    } catch {
      setServerOk(false);
      setLErrs({ general: "Cannot reach the server. Make sure WAMP is running." });
    }
    setSubmitting(false);
  };

  // ── SIGNUP ─────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (validate.name(sName))             errs.name  = validate.name(sName);
    if (validate.email(sEmail))           errs.email = validate.email(sEmail);
    if (sPhone && !/^\d{10}$/.test(sPhone.replace(/\D/g,""))) errs.phone = "Enter a valid 10-digit number";
    if (validate.password(sPass))         errs.pass  = validate.password(sPass);
    if (validate.confirm(sPass, sConf))   errs.conf  = validate.confirm(sPass, sConf);
    if (!sAgree) errs.agree = "You must agree to the terms to continue";
    setSErrs(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const data = await api.post("register", {
        name: sName, email: sEmail, phone: sPhone, role: sRole, password: sPass
      });

      if (!data.success) {
        setSErrs(data.errors || { general: data.error || "Registration failed." });
        setSubmitting(false);
        return;
      }

      // Go to OTP screen — store pending login info
      setOtpTarget({ email: sEmail, password: sPass, name: sName });
      setOtpVals(["","","","","",""]);
      setOtpErr("");
      setSubmitting(false);
      setView("otp");
      setTimeout(() => otpRefs[0].current?.focus(), 200);

    } catch {
      setServerOk(false);
      setSErrs({ general: "Cannot reach the server. Make sure WAMP is running." });
      setSubmitting(false);
    }
  };

  // ── OTP VERIFY ─────────────────────────────────────────────────────────────
  // For demo: code is 246810. In prod: generate & email a real OTP, verify server-side.
  const handleOtp = async () => {
    const code = otpVals.join("");
    if (code.length < 6)  { setOtpErr("Please enter all 6 digits"); return; }
    if (code !== "246810"){ setOtpErr("Invalid code. Demo code: 246810"); return; }

    setSubmitting(true);
    try {
      // Auto-login after verification
      const data = await api.post("login", { email: otpTarget.email, password: otpTarget.password });
      if (!data.success) { setOtpErr("Login after verification failed. Please sign in manually."); setSubmitting(false); return; }

      api.setToken(data.token);
      const sess = { ...data.user, loginAt: new Date().toISOString() };
      api.setSession(sess);
      onLogin(sess);
      showToast(`Account created! Welcome, ${otpTarget.name.split(" ")[0]}! ⚖️`);

    } catch {
      setServerOk(false);
      setOtpErr("Server error. Make sure WAMP is running.");
    }
    setSubmitting(false);
  };

  const handleOtpKey = (i, e) => {
    const val = e.target.value.replace(/\D/g,"").slice(-1);
    const next = [...otpVals]; next[i] = val; setOtpVals(next);
    setOtpErr("");
    if (val && i < 5) otpRefs[i+1].current?.focus();
    if (!val && e.nativeEvent.inputType === "deleteContentBackward" && i > 0) otpRefs[i-1].current?.focus();
  };

  // ── FORGOT ─────────────────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!fEmail || validate.email(fEmail)) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900)); // simulate
    setFSent(true);
    setSubmitting(false);
  };

  const strLevel = PASSWORD_STRENGTH(sPass);
  const strLabel = ["","Weak","Fair","Good","Strong","Very Strong"][strLevel];
  const strColor = ["","#ef4444","#f59e0b","#f59e0b","#10b981","#10b981"][strLevel];

  const roles = [
    { id: "citizen",   label: "Citizen",   sub: "Get legal help", icon: "👤" },
    { id: "paralegal", label: "Paralegal", sub: "Review cases",   icon: "⚖️" },
    { id: "admin",     label: "Admin",     sub: "Manage platform",icon: "🛡️" },
  ];

  // ── LEFT PANEL ─────────────────────────────────────────────────────────────
  const LeftPanel = () => (
    <div className="auth-left">
      <svg className="auth-left-bg-scale" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.4">
        <path d="M12 3v18"/><path d="M3 9l9-6 9 6"/>
        <path d="M5 16H3a1 1 0 01-1-1v-1l3-6 3 6v1a1 1 0 01-1 1H5z"/>
        <path d="M19 16h-2a1 1 0 01-1-1v-1l3-6 3 6v1a1 1 0 01-1 1H19z"/>
      </svg>
      <div>
        <div className="al-brand">
          <div className="al-logo"><ScaleIcon /></div>
          <div><div className="al-name">NyayaSetu</div><div className="al-sub">AI LEGAL AID</div></div>
        </div>
        <div className="al-content">
          <h2 className="al-headline">Justice should be<br/><em>accessible to all.</em></h2>
          <p className="al-desc">Describe your legal problem in plain language. We classify it, find the right court, draft a formal petition — free of charge, in your language.</p>
          <div className="al-features">
            {[
              { icon:"📝", title:"AI Petition Drafting",  desc:"Formal Indian legal petitions generated instantly." },
              { icon:"🏛", title:"Court Finder",          desc:"Automatic routing by state, district & case type." },
              { icon:"🌐", title:"6 Indian Languages",    desc:"Hindi, Telugu, Tamil, Kannada, Bengali, English." },
            ].map((f,i) => (
              <div key={i} className="al-feat">
                <div className="al-feat-icon">{f.icon}</div>
                <div><div className="al-feat-title">{f.title}</div><div className="al-feat-desc">{f.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="al-bottom">
        {[["🔒","Secure & Private"],["⚖","NALSA Aligned"],["🆓","100% Free"]].map(([icon,label],i) => (
          <div key={i} className="al-badge"><span>{icon}</span>{label}</div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{AUTH_CSS}</style>
      <div className="auth-root">
        <div className="auth-wrap">
          <LeftPanel />

          <div className="auth-right">
            <div className="auth-form-shell">

              {/* Mobile brand */}
              <div className="auth-mobile-logo">
                <div className="ml-logo"><ScaleIcon /></div>
                <div><div className="ml-name">NyayaSetu</div><div className="ml-sub">AI LEGAL AID</div></div>
              </div>

              {/* Server offline warning */}
              {!serverOk && (
                <div className="srv-warn">
                  ⚠ WAMP server not reachable. Start WAMP and ensure Apache + MySQL are green.
                </div>
              )}

              {/* ── LOGIN ── */}
              {view === "login" && (
                <form onSubmit={handleLogin} noValidate>
                  <div className="f-head">
                    <h1 className="f-title">Sign In</h1>
                    <p className="f-sub">Welcome back — access your legal aid dashboard</p>
                  </div>

                  {lErrs.general && <div className="g-err">⚠ {lErrs.general}</div>}

                  <div className="fg">
                    <label className="flabel">Email Address</label>
                    <div className="fi-wrap">
                      <span className="fi-icon">✉</span>
                      <input type="email" className={`finput ${lErrs.email?"err":""}`}
                        placeholder="yourname@email.com" value={lEmail} autoComplete="email"
                        onChange={e=>{ setLEmail(e.target.value); setLErrs(x=>({...x,email:"",general:""})); }}
                      />
                    </div>
                    {lErrs.email && <div className="f-err"><ChkN/> {lErrs.email}</div>}
                  </div>

                  <div className="fg">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <label className="flabel">Password</label>
                      <button type="button" className="fgt-link" onClick={()=>{setView("forgot");setFSent(false);}}>Forgot password?</button>
                    </div>
                    <div className="fi-wrap">
                      <span className="fi-icon">🔒</span>
                      <input type={lShowP?"text":"password"} className={`finput ${lErrs.pass?"err":""}`}
                        placeholder="Enter your password" value={lPass} autoComplete="current-password"
                        onChange={e=>{ setLPass(e.target.value); setLErrs(x=>({...x,pass:"",general:""})); }}
                      />
                      <button type="button" className="fi-eye" onClick={()=>setLShowP(!lShowP)}><Eye show={lShowP}/></button>
                    </div>
                    {lErrs.pass && <div className="f-err"><ChkN/> {lErrs.pass}</div>}
                  </div>

                  <div className="chk-row" style={{marginBottom:18}} onClick={()=>setLRem(!lRem)}>
                    <div className={`chk-box ${lRem?"on":""}`}>{lRem&&<ChkY/>}</div>
                    <span className="chk-txt">Keep me signed in on this device</span>
                  </div>

                  <button type="submit" className="sub-btn" disabled={submitting}>
                    {submitting ? <><div className="btn-spin"/> Signing in…</> : "Sign In to NyayaSetu"}
                  </button>

                  <div className="sw-row">
                    Don't have an account?{" "}
                    <button type="button" className="sw-link" onClick={()=>{setView("signup");setLErrs({});}}>Create account</button>
                  </div>
                </form>
              )}

              {/* ── SIGNUP ── */}
              {view === "signup" && (
                <form onSubmit={handleSignup} noValidate>
                  <div className="f-head">
                    <h1 className="f-title">Create Account</h1>
                    <p className="f-sub">Join NyayaSetu — free legal aid for every Indian</p>
                  </div>

                  {sErrs.general && <div className="g-err">⚠ {sErrs.general}</div>}

                  {/* Role */}
                  <label className="flabel" style={{marginBottom:8,display:"block"}}>I am a</label>
                  <div className="role-grid">
                    {roles.map(r => (
                      <div key={r.id} className={`role-card ${sRole===r.id?"active":""}`} onClick={()=>setSRole(r.id)}>
                        <div className="role-icon">{r.icon}</div>
                        <span className="role-lbl">{r.label}</span>
                        <span className="role-sub">{r.sub}</span>
                      </div>
                    ))}
                  </div>

                  <div className="row-2">
                    <div className="fg">
                      <label className="flabel">Full Name</label>
                      <div className="fi-wrap">
                        <span className="fi-icon">👤</span>
                        <input type="text" className={`finput ${sErrs.name?"err":sName.length>=2?"":""}`}
                          placeholder="Ravi Kumar" value={sName} autoComplete="name"
                          onChange={e=>{ setSName(e.target.value); setSErrs(x=>({...x,name:""})); }}
                        />
                      </div>
                      {sErrs.name ? <div className="f-err"><ChkN/> {sErrs.name}</div>
                        : sName.length>=2 ? <div className="f-ok"><ChkY/> Looks good</div> : null}
                    </div>
                    <div className="fg">
                      <label className="flabel">Mobile (opt)</label>
                      <div className="fi-wrap">
                        <span className="fi-icon">📱</span>
                        <input type="tel" className={`finput ${sErrs.phone?"err":""}`}
                          placeholder="9876543210" value={sPhone} autoComplete="tel"
                          onChange={e=>{ setSPhone(e.target.value); setSErrs(x=>({...x,phone:""})); }}
                        />
                      </div>
                      {sErrs.phone && <div className="f-err"><ChkN/> {sErrs.phone}</div>}
                    </div>
                  </div>

                  <div className="fg">
                    <label className="flabel">Email Address</label>
                    <div className="fi-wrap">
                      <span className="fi-icon">✉</span>
                      <input type="email" className={`finput ${sErrs.email?"err":sEmail&&!validate.email(sEmail)?"":""}`}
                        placeholder="yourname@email.com" value={sEmail} autoComplete="email"
                        onChange={e=>{ setSEmail(e.target.value); setSErrs(x=>({...x,email:""})); }}
                      />
                    </div>
                    {sErrs.email ? <div className="f-err"><ChkN/> {sErrs.email}</div>
                      : sEmail&&!validate.email(sEmail) ? <div className="f-ok"><ChkY/> Valid email</div> : null}
                  </div>

                  <div className="fg">
                    <label className="flabel">Password</label>
                    <div className="fi-wrap">
                      <span className="fi-icon">🔒</span>
                      <input type={sShowP?"text":"password"} className={`finput ${sErrs.pass?"err":""}`}
                        placeholder="Min. 8 chars, 1 uppercase, 1 number" value={sPass} autoComplete="new-password"
                        onChange={e=>{ setSPass(e.target.value); setSErrs(x=>({...x,pass:""})); }}
                      />
                      <button type="button" className="fi-eye" onClick={()=>setSShowP(!sShowP)}><Eye show={sShowP}/></button>
                    </div>
                    {sPass && (
                      <>
                        <div className="str-bars">
                          {[1,2,3,4,5].map(i=>(
                            <div key={i} className="str-bar" style={{background:i<=strLevel?strColor:undefined}}/>
                          ))}
                        </div>
                        <div className="str-lbl" style={{color:strColor}}>{strLabel}</div>
                      </>
                    )}
                    {sErrs.pass && <div className="f-err"><ChkN/> {sErrs.pass}</div>}
                  </div>

                  <div className="fg">
                    <label className="flabel">Confirm Password</label>
                    <div className="fi-wrap">
                      <span className="fi-icon">🔒</span>
                      <input type={sShowC?"text":"password"} className={`finput ${sErrs.conf?"err":sConf&&sConf===sPass?"":""}`}
                        placeholder="Repeat your password" value={sConf} autoComplete="new-password"
                        onChange={e=>{ setSConf(e.target.value); setSErrs(x=>({...x,conf:""})); }}
                      />
                      <button type="button" className="fi-eye" onClick={()=>setSShowC(!sShowC)}><Eye show={sShowC}/></button>
                    </div>
                    {sErrs.conf ? <div className="f-err"><ChkN/> {sErrs.conf}</div>
                      : sConf&&sConf===sPass ? <div className="f-ok"><ChkY/> Passwords match</div> : null}
                  </div>

                  <div className="chk-row" onClick={()=>{ setSAgree(!sAgree); setSErrs(x=>({...x,agree:""})); }}>
                    <div className={`chk-box ${sAgree?"on":""} ${sErrs.agree?"err":""}`}>{sAgree&&<ChkY/>}</div>
                    <span className="chk-txt">
                      I agree to the <a href="#" onClick={e=>e.preventDefault()}>Terms of Service</a> and{" "}
                      <a href="#" onClick={e=>e.preventDefault()}>Privacy Policy</a>.
                      This platform is for legal assistance only and does not constitute legal advice.
                    </span>
                  </div>
                  {sErrs.agree && <div className="f-err" style={{marginTop:-10,marginBottom:12}}><ChkN/> {sErrs.agree}</div>}

                  <button type="submit" className="sub-btn" disabled={submitting}>
                    {submitting ? <><div className="btn-spin"/> Creating account…</> : "Create My Account →"}
                  </button>

                  <div className="sw-row">
                    Already have an account?{" "}
                    <button type="button" className="sw-link" onClick={()=>{setView("login");setSErrs({});}}>Sign in</button>
                  </div>
                </form>
              )}

              {/* ── OTP ── */}
              {view === "otp" && (
                <div>
                  <div className="f-head">
                    <h1 className="f-title">Verify Your Email</h1>
                    <p className="f-sub">Enter the 6-digit code sent to <b style={{color:"var(--gold)"}}>{otpTarget?.email}</b></p>
                  </div>
                  <div className="otp-hint">🔑 Demo OTP: <b style={{color:"var(--gold)"}}>246810</b></div>
                  <div className="otp-grid">
                    {otpVals.map((v,i) => (
                      <input key={i}
                        ref={el => { otpRefs[i].current = el; }}
                        type="text" inputMode="numeric"
                        className={`otp-input ${v?"filled":""}`}
                        value={v} maxLength={1}
                        onChange={e => handleOtpKey(i,e)}
                        onKeyDown={e => { if(e.key==="Backspace"&&!otpVals[i]&&i>0) otpRefs[i-1].current?.focus(); }}
                        onPaste={e => {
                          const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
                          if(p.length===6){ setOtpVals(p.split("")); otpRefs[5].current?.focus(); e.preventDefault(); }
                        }}
                      />
                    ))}
                  </div>
                  {otpErr && <div className="g-err" style={{marginBottom:14}}>⚠ {otpErr}</div>}
                  <button className="sub-btn" onClick={handleOtp} disabled={submitting}>
                    {submitting ? <><div className="btn-spin"/> Verifying…</> : "Verify & Enter NyayaSetu"}
                  </button>
                  <div className="sw-row" style={{marginTop:14}}>
                    <button type="button" className="sw-link" onClick={()=>setView("signup")}>← Back to signup</button>
                  </div>
                </div>
              )}

              {/* ── FORGOT ── */}
              {view === "forgot" && (
                <form onSubmit={handleForgot} noValidate>
                  <div className="f-head">
                    <h1 className="f-title">{fSent?"Check Your Email":"Reset Password"}</h1>
                    <p className="f-sub">{fSent?`Reset link sent to ${fEmail}`:"We'll send a password reset link"}</p>
                  </div>
                  {!fSent ? (
                    <>
                      <div className="fg">
                        <label className="flabel">Email Address</label>
                        <div className="fi-wrap">
                          <span className="fi-icon">✉</span>
                          <input type="email" className="finput" placeholder="yourname@email.com"
                            value={fEmail} onChange={e=>setFEmail(e.target.value)} autoFocus/>
                        </div>
                      </div>
                      <button type="submit" className="sub-btn" disabled={submitting||!fEmail||!!validate.email(fEmail)}>
                        {submitting?<><div className="btn-spin"/> Sending…</>:"Send Reset Link"}
                      </button>
                    </>
                  ) : (
                    <div style={{textAlign:"center",padding:"20px 0"}}>
                      <div style={{fontSize:44,marginBottom:12}}>📬</div>
                      <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.7,marginBottom:20}}>
                        If an account exists for <b style={{color:"var(--gold)"}}>{fEmail}</b>, you'll receive a reset link within 5 minutes.
                      </p>
                      <button className="sub-btn" type="button" onClick={()=>{setView("login");setFSent(false);setFEmail("");}}>Back to Sign In</button>
                    </div>
                  )}
                  {!fSent && (
                    <div className="sw-row">
                      <button type="button" className="sw-link" onClick={()=>setView("login")}>← Back to sign in</button>
                    </div>
                  )}
                </form>
              )}

            </div>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className="auth-toast">
            <div className={`auth-toast-inner ${toast.type}`}>
              <span>{toast.type==="success"?"✓":toast.type==="error"?"✕":"ℹ"}</span>
              {toast.msg}
            </div>
          </div>
        )}
      </div>
    </>
  );
}