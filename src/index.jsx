import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import NyayaSetuV2 from "./NyayaSetuV2";

const API = "https://molasses-squint-finlike.ngrok-free.dev/nyayasetu-api/auth";

export default function Index() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nyaya_token");
    if (!token) { setLoading(false); return; }

    fetch(`${API}/me.php`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          const saved = localStorage.getItem("nyaya_session");
          setSession(saved ? JSON.parse(saved) : { ...data.user, loginAt: new Date().toISOString() });
        } else {
          localStorage.removeItem("nyaya_token");
          localStorage.removeItem("nyaya_session");
        }
      })
      .catch(() => {
        // WAMP offline — restore from localStorage so app still works
        const saved = localStorage.getItem("nyaya_session");
        if (saved) { try { setSession(JSON.parse(saved)); } catch {} }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (sess) => setSession(sess);

  const handleLogout = async () => {
    const token = localStorage.getItem("nyaya_token");
    if (token) {
      try { await fetch(`${API}/logout.php`, { headers: { Authorization: `Bearer ${token}` } }); }
      catch {} // fine if WAMP offline
    }
    localStorage.removeItem("nyaya_token");
    localStorage.removeItem("nyaya_session");
    setSession(null);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0c0b09", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:42, height:42, border:"2px solid rgba(200,169,110,0.15)", borderTopColor:"#c8a96e", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!session) return <Auth onLogin={handleLogin} />;
  return <NyayaSetuV2 session={session} onLogout={handleLogout} />;
}