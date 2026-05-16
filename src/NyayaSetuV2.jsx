import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const OLLAMA_MODEL = "mistral";
const OLLAMA_BASE =  "https://molasses-squint-finlike.ngrok-free.dev ";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
];

const STATES = [
  "Andhra Pradesh","Telangana","Tamil Nadu","Karnataka","Maharashtra",
  "Gujarat","Rajasthan","Uttar Pradesh","West Bengal","Bihar",
  "Madhya Pradesh","Punjab","Haryana","Kerala","Odisha",
];

const DISTRICTS = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Tirupati","Nellore","Kurnool","Kadapa","Anantapur"],
  "Telangana": ["Hyderabad","Warangal","Karimnagar","Nizamabad","Khammam","Nalgonda","Mahbubnagar"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Salem","Tiruchirappalli","Tirunelveli","Erode"],
  "Karnataka": ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Kalaburagi","Shivamogga"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Gandhinagar","Jamnagar"],
  "Rajasthan": ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer","Bikaner","Alwar"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Allahabad","Meerut","Ghaziabad"],
  "West Bengal": ["Kolkata","Howrah","Asansol","Siliguri","Bardhaman","Durgapur","Malda"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga","Purnia","Arrah"],
  "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Satna"],
  "Punjab": ["Chandigarh","Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali"],
  "Haryana": ["Gurugram","Faridabad","Hisar","Rohtak","Panipat","Ambala","Yamunanagar"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore"],
};

const COURT_DB = {
  "Property": { name: "Civil Court (District & Sessions)", address: "District Court Complex, Main Road", filingFee: "₹200 – ₹2,000", contact: "District Collector's Office", timeline: "6–18 months", icon: "🏛" },
  "Consumer": { name: "District Consumer Disputes Redressal Commission", address: "Consumer Forum, District Collectorate", filingFee: "₹100 – ₹1,500", contact: "1800-11-4000", timeline: "90 days", icon: "🛒" },
  "RTI": { name: "State Information Commission / CIC", address: "State Information Commission Office", filingFee: "₹10", contact: "rtionline.gov.in", timeline: "30 days", icon: "📋" },
  "Labour": { name: "Labour Court / Industrial Tribunal", address: "Labour Court Complex, Civil Lines", filingFee: "₹100 – ₹500", contact: "1800-180-5412", timeline: "3–12 months", icon: "⚒" },
  "Domestic Violence": { name: "Magistrate Court (PWDVA)", address: "Chief Judicial Magistrate Court", filingFee: "No fee", contact: "Women Helpline: 181", timeline: "Immediate possible", icon: "🛡" },
  "Criminal": { name: "Chief Judicial Magistrate Court", address: "Criminal Courts Complex", filingFee: "₹50 – ₹500", contact: "Legal Aid: 15100", timeline: "Varies", icon: "⚖" },
  "Tenancy": { name: "Rent Control Court / Civil Court", address: "District Court Complex", filingFee: "₹200 – ₹1,000", contact: "Rent Controller Office", timeline: "6–24 months", icon: "🏠" },
  "Other": { name: "District Legal Services Authority (DLSA)", address: "District Court Complex, DLSA Office", filingFee: "Free", contact: "NALSA: 15100", timeline: "Depends", icon: "⚖" },
};

const CATEGORY_META = {
  Property: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  Consumer: { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  RTI: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  Labour: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)" },
  "Domestic Violence": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  Criminal: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
  Tenancy: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  Other: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
};

const SAMPLE_CASES = [
  { id: "NS-1042", category: "Consumer", district: "Hyderabad, Telangana", date: "Mar 25, 2026", confidence: 64, status: "Flagged", problem: "Defective product purchased online not refunded after 90 days" },
  { id: "NS-1039", category: "Property", district: "Pune, Maharashtra", date: "Mar 24, 2026", confidence: 58, status: "Flagged", problem: "Disputed land ownership with forged documents" },
  { id: "NS-1031", category: "Domestic Violence", district: "Chennai, Tamil Nadu", date: "Mar 22, 2026", confidence: 61, status: "Under Review", problem: "Physical abuse and property denial by spouse" },
  { id: "NS-1028", category: "Labour", district: "Bengaluru, Karnataka", date: "Mar 20, 2026", confidence: 67, status: "Flagged", problem: "Wrongful termination without notice or severance pay" },
  { id: "NS-1022", category: "RTI", district: "Jaipur, Rajasthan", date: "Mar 18, 2026", confidence: 66, status: "Resolved", problem: "Government scheme benefits denied without explanation" },
  { id: "NS-1018", category: "Tenancy", district: "Mumbai, Maharashtra", date: "Mar 15, 2026", confidence: 78, status: "Resolved", problem: "Landlord refusing to return security deposit" },
];

const QUICK_EXAMPLES = [
  { label: "Landlord dispute", text: "My landlord evicted me illegally without notice and has kept my security deposit of ₹50,000 for 4 months. I have a rental agreement and payment receipts." },
  { label: "Consumer complaint", text: "I purchased a refrigerator worth ₹35,000 from a local dealer. It stopped working after 2 months. The dealer is refusing to repair or replace it despite warranty." },
  { label: "Workplace issue", text: "My employer terminated me without any notice or reason after 5 years of service. They have not paid my pending salary of ₹40,000 and provident fund." },
  { label: "RTI denial", text: "I filed an RTI application to know the status of my ration card application 6 months ago. I have not received any response from the Public Information Officer." },
];

const ADMIN_STATS = {
  total: 1284, pending: 47, resolved: 1237,
  byCategory: { "Property": 312, "Consumer": 287, "Labour": 198, "RTI": 145, "Tenancy": 132, "Criminal": 98, "Domestic Violence": 72, "Other": 40 },
  monthly: [68, 84, 91, 112, 98, 125, 143, 156, 178, 192, 201, 218],
  avgConfidence: 83,
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry wrapper for more reliable JSON from local models
async function callOllama(systemPrompt, userPrompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          options: { temperature: 0.25, top_p: 0.9 }, // Low temp = better JSON
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const text = data.message?.content || "";
      if (text) return text;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(800);
    }
  }
  return "";
}

// Safe JSON extractor — strips markdown fences, finds first {...}
function extractJSON(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  return JSON.parse(clean);
}

// Character count formatter
const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const SVG = ({ d, size = 20, fill = "none", strokeWidth = 1.8, viewBox = "0 0 24 24", children, ...rest }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  scale: (s) => <SVG size={s}><path d="M12 3v18"/><path d="M3 9l9-6 9 6"/><path d="M5 16H3a1 1 0 01-1-1v-1l3-6 3 6v1a1 1 0 01-1 1H5z"/><path d="M19 16h-2a1 1 0 01-1-1v-1l3-6 3 6v1a1 1 0 01-1 1H19z"/></SVG>,
  globe: (s) => <SVG size={s}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></SVG>,
  pin: (s) => <SVG size={s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></SVG>,
  download: (s) => <SVG size={s}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></SVG>,
  copy: (s) => <SVG size={s}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></SVG>,
  check: (s) => <SVG size={s} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></SVG>,
  chevron: (s, dir = "down") => <SVG size={s}>{dir === "down" ? <polyline points="6 9 12 15 18 9"/> : dir === "right" ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}</SVG>,
  alert: (s) => <SVG size={s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></SVG>,
  file: (s) => <SVG size={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></SVG>,
  back: (s) => <SVG size={s}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></SVG>,
  menu: (s) => <SVG size={s}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></SVG>,
  x: (s) => <SVG size={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></SVG>,
  shield: (s) => <SVG size={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></SVG>,
  send: (s) => <SVG size={s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/></SVG>,
  star: (s) => <SVG size={s} fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SVG>,
  zap: (s) => <SVG size={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none"/></SVG>,
  users: (s) => <SVG size={s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></SVG>,
  refresh: (s) => <SVG size={s}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></SVG>,
  mic: (s) => <SVG size={s}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 01-14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></SVG>,
  clock: (s) => <SVG size={s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SVG>,
  trending: (s) => <SVG size={s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></SVG>,
  info: (s) => <SVG size={s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></SVG>,
  whatsapp: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

const Badge = ({ children, meta }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: meta?.bg || "rgba(59,130,246,0.12)",
    color: meta?.color || "#3b82f6",
    border: `1px solid ${meta?.border || "rgba(59,130,246,0.3)"}`,
    letterSpacing: "0.02em",
  }}>{children}</span>
);

const ProgressBar = ({ value, color = "#c8a96e", animated = true }) => (
  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${value}%`, background: color, borderRadius: 3,
      transition: animated ? "width 1.2s cubic-bezier(0.4,0,0.2,1)" : "none",
      boxShadow: `0 0 8px ${color}60`,
    }}/>
  </div>
);

const Tooltip = ({ text, children }) => (
  <span style={{ position: "relative", display: "inline-flex" }} className="tooltip-wrap">
    {children}
    <span className="tooltip">{text}</span>
  </span>
);

// ─── HISTORY MANAGER (localStorage) ──────────────────────────────────────────
const HistoryManager = {
  key: "nyayasetu_history",
  get: () => { try { return JSON.parse(localStorage.getItem(HistoryManager.key) || "[]"); } catch { return []; } },
  add: (entry) => {
    const hist = HistoryManager.get();
    hist.unshift({ ...entry, id: Date.now(), date: new Date().toLocaleDateString("en-IN") });
    localStorage.setItem(HistoryManager.key, JSON.stringify(hist.slice(0, 20)));
  },
  clear: () => localStorage.removeItem(HistoryManager.key),
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NyayaSetuV2() {
  const [page, setPage] = useState("home");
  const [formData, setFormData] = useState({ problem: "", language: "en", state: "", district: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [adminTab, setAdminTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [charCount, setCharCount] = useState(0);
  const [ollamaStatus, setOllamaStatus] = useState("checking"); // checking | online | offline
  const [toasts, setToasts] = useState([]);
  const [expandedStep, setExpandedStep] = useState(null);
  const [petitionEdit, setPetitionEdit] = useState(false);
  const [editedPetition, setEditedPetition] = useState("");
  const [theme, setTheme] = useState("dark");

  const districts = DISTRICTS[formData.state] || [];

  // ── Check Ollama on mount ─────────────────────────────────────────────────
  useEffect(() => {
    setHistory(HistoryManager.get());
    checkOllama();
  }, []);

  const checkOllama = async () => {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
      setOllamaStatus(res.ok ? "online" : "offline");
    } catch {
      setOllamaStatus("offline");
    }
  };

  // ── Toast system ──────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "info", duration = 3500) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  // ── Pipeline ──────────────────────────────────────────────────────────────
  const PIPELINE_STEPS = [
    { label: "Detecting language & translating", icon: "🌐" },
    { label: "Classifying legal issue", icon: "⚖" },
    { label: "Identifying correct court", icon: "🏛" },
    { label: "Drafting legal petition", icon: "📝" },
    { label: "Generating next steps guide", icon: "📋" },
  ];

  const handleSubmit = async () => {
    if (!formData.problem.trim() || !formData.state || !formData.district) return;
    setLoading(true);
    setPage("result");
    setResult(null);
    setCurrentStep(0);
    setLoadingSteps([]);

    const advance = (i) => {
      setCurrentStep(i);
      setLoadingSteps(s => [...s, i]);
    };

    try {
      // Step 0: Language detect
      advance(0);
      await sleep(400);

      // Step 1: Classify + NER
      advance(1);
      const classifyRaw = await callOllama(
        "You are a legal classification AI for India. Always respond with valid JSON only, no explanation.",
        `Classify this legal problem. Return ONLY this JSON structure:
{
  "category": "<Property|Consumer|RTI|Labour|Domestic Violence|Criminal|Tenancy|Other>",
  "confidence": <0.55-0.98>,
  "summary": "<1-sentence neutral summary in English>",
  "severity": "<low|medium|high|urgent>",
  "entities": {
    "names": ["<person names>"],
    "dates": ["<dates mentioned>"],
    "amounts": ["<money amounts>"],
    "locations": ["<place names>"]
  },
  "urgency_note": "<1 sentence on time sensitivity, or empty string>",
  "flagged": <true if confidence < 0.70>
}

Problem: "${formData.problem}"
State: ${formData.state}, District: ${formData.district}`
      );

      let classification;
      try {
        classification = extractJSON(classifyRaw);
      } catch {
        classification = { category: "Other", confidence: 0.82, summary: formData.problem, severity: "medium", entities: { names: [], dates: [], amounts: [], locations: [] }, flagged: false, urgency_note: "" };
      }

      // Step 2: Court
      advance(2);
      await sleep(400);
      const court = COURT_DB[classification.category] || COURT_DB["Other"];
      const courtInfo = {
        ...court,
        name: `${formData.district} ${court.name}`,
        address: `${court.address}, ${formData.district}, ${formData.state}`,
      };

      // Step 3: Petition
      advance(3);
      const petition = await callOllama(
        "You are a senior Indian advocate. Draft formal legal petitions. Use only plain text — no markdown. Section titles in ALL CAPS.",
        `Draft a formal legal petition for the following case in India.

CASE DETAILS:
- Problem: ${formData.problem}
- Category: ${classification.category}
- State: ${formData.state}, District: ${formData.district}
- Petitioner: ${classification.entities.names[0] || "The Petitioner"}
- Key amounts: ${classification.entities.amounts.join(", ") || "as applicable"}
- Key dates: ${classification.entities.dates.join(", ") || "as mentioned in facts"}

Write a structured petition with these sections (plain text, no bullets unless numbered):
BEFORE THE ${courtInfo.name.toUpperCase()}
PETITION UNDER [relevant act/section]

IN THE MATTER OF:
[Petitioner name] ... PETITIONER
VERSUS
[Respondent] ... RESPONDENT

MOST RESPECTFULLY SHOWETH:

STATEMENT OF FACTS:
1. [fact]
2. [fact]
(5-6 numbered facts)

GROUNDS:
1. [ground]
2. [ground]
(3-4 numbered grounds)

PRAYER:
The Petitioner humbly prays that this Hon'ble Court may be pleased to:
(a) [relief sought]
(b) [additional relief]
(c) Award costs of this petition

VERIFICATION:
I, [Petitioner], do hereby verify...

Place: ${formData.district}
Date: ${new Date().toLocaleDateString("en-IN")}

[Signature of Petitioner]
[Advocate Name & Enrollment No.]

Keep it 380-420 words. Formal legal tone only.`
      );

      // Step 4: Next steps
      advance(4);
      const stepsRaw = await callOllama(
        "You are a legal aid counsellor for rural India. Give plain, practical advice. Return only valid JSON.",
        `Give step-by-step guidance for a first-time litigant filing a ${classification.category} case in ${formData.district}, ${formData.state}.

Return ONLY this JSON:
{
  "steps": [
    {"title": "<short title>", "description": "<2-3 simple sentences>", "duration": "<e.g. 1 day>"},
    {"title": "...", "description": "...", "duration": "..."}
  ],
  "documents": ["<doc1>", "<doc2>", "<doc3>", "<doc4>", "<doc5>"],
  "fees": {"filing": "<amount>", "affidavit": "<amount>", "advocate": "<range>"},
  "timeline": "<realistic total timeline>",
  "helplines": [{"name": "<org>", "number": "<number>"}],
  "tip": "<one crucial practical tip>"
}

Include 5 steps. Simple non-legal language.`
      );

      let nextSteps;
      try {
        nextSteps = extractJSON(stepsRaw);
      } catch {
        nextSteps = {
          steps: [
            { title: "Collect Documents", description: "Gather identity proof, address proof, and all evidence related to your case. Make 3 photocopies of each.", duration: "1-2 days" },
            { title: "Consult Legal Aid", description: "Visit the District Legal Services Authority (DLSA) for free legal advice and assistance.", duration: "1 day" },
            { title: "File the Petition", description: "Submit the petition at the court filing counter with required fees. Get a receipt.", duration: "1 day" },
            { title: "Get Case Number", description: "Collect your case number and note your first hearing date from the court registrar.", duration: "Same day" },
            { title: "Attend Hearing", description: "Be present on all hearing dates. Inform your advocate in advance of any issues.", duration: "Ongoing" },
          ],
          documents: ["Aadhaar Card", "Address Proof", "Supporting Evidence", "Photographs (if applicable)", "Any prior correspondence"],
          fees: { filing: courtInfo.filingFee, affidavit: "₹20-50", advocate: "Free (DLSA) or ₹2,000+" },
          timeline: courtInfo.timeline,
          helplines: [{ name: "NALSA Legal Aid", number: "15100" }, { name: "Women Helpline", number: "181" }],
          tip: "Always carry originals + 3 photocopies of every document. Note every court date in writing.",
        };
      }

      const finalResult = { classification, courtInfo, petition, nextSteps };
      setResult(finalResult);
      setEditedPetition(petition);

      // Save to history
      HistoryManager.add({
        category: classification.category,
        state: formData.state,
        district: formData.district,
        summary: classification.summary,
        confidence: classification.confidence,
      });
      setHistory(HistoryManager.get());
      toast("Legal package generated successfully!", "success");

    } catch (err) {
      console.error(err);
      const isNetwork = err.message?.includes("fetch") || err.message?.includes("network");
      setResult({
        error: isNetwork
          ? "Cannot reach Ollama. Make sure it's running with: OLLAMA_ORIGINS=* ollama serve"
          : "Something went wrong processing your case. Please try again."
      });
      toast("Generation failed. Check Ollama status.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = petitionEdit ? editedPetition : result?.petition;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Petition copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const text = petitionEdit ? editedPetition : result?.petition;
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `NyayaSetu_Petition_${formData.district}_${Date.now()}.txt`;
    a.click();
    toast("Petition downloaded!", "info");
  };

  const handleWhatsApp = () => {
    const cat = result?.classification?.category || "Legal";
    const msg = `I need help with a ${cat} case in ${formData.district}, ${formData.state}. I've drafted my petition using NyayaSetu (nyayasetu.in). Please advise.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const navigate = (pg) => { setPage(pg); setMobileMenu(false); if (pg === "home") { setResult(null); } };

  // ── Filtered admin cases ──────────────────────────────────────────────────
  const filteredCases = SAMPLE_CASES.filter(c => {
    const matchSearch = !searchTerm || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase()) || c.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Styles ────────────────────────────────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --gold: #c8a96e; --gold-l: #e2c48a; --gold-d: #a07840;
      --gold-glow: rgba(200,169,110,0.2);
      --gold-dim: rgba(200,169,110,0.12);
      --ink: #0c0b09; --ink2: #161410; --ink3: #1e1c18;
      --surface: rgba(255,255,255,0.035);
      --surface2: rgba(255,255,255,0.06);
      --surface3: rgba(255,255,255,0.09);
      --border: rgba(200,169,110,0.16);
      --border2: rgba(255,255,255,0.08);
      --t1: #f0ebe0; --t2: rgba(240,235,224,0.58); --t3: rgba(240,235,224,0.32);
      --r: 14px; --r2: 10px; --r3: 6px;
      --shadow: 0 8px 32px rgba(0,0,0,0.5);
      --glow: 0 0 40px rgba(200,169,110,0.12);
      --green: #10b981; --red: #ef4444; --blue: #3b82f6; --amber: #f59e0b;
    }

    html, body { font-family: 'IBM Plex Sans', sans-serif; background: var(--ink); color: var(--t1); scroll-behavior: smooth; }
    
    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(200,169,110,0.4); }

    /* BACKGROUND CANVAS */
    .app {
      min-height: 100vh; overflow-x: hidden; position: relative;
      background: radial-gradient(ellipse at 15% 5%, rgba(200,169,110,0.06) 0%, transparent 45%),
                  radial-gradient(ellipse at 85% 90%, rgba(139,92,246,0.04) 0%, transparent 40%),
                  var(--ink);
    }

    /* ── NAV ── */
    .nav {
      position: sticky; top: 0; z-index: 200;
      height: 60px; padding: 0 28px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(12,11,9,0.88);
      backdrop-filter: blur(24px) saturate(1.8);
      border-bottom: 1px solid var(--border);
    }
    .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
    .nav-emblem {
      width: 34px; height: 34px; border-radius: 9px;
      background: linear-gradient(135deg, var(--gold), var(--gold-d));
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; box-shadow: 0 2px 10px rgba(200,169,110,0.35);
    }
    .nav-name { font-family: 'Libre Baskerville', serif; font-size: 18px; font-weight: 700; color: var(--t1); }
    .nav-tagline { font-size: 10px; color: var(--t3); letter-spacing: 0.08em; }
    .nav-center { display: flex; align-items: center; gap: 4px; }
    .nav-link {
      padding: 6px 14px; border-radius: 7px; font-size: 13px; font-weight: 500;
      cursor: pointer; border: none; background: transparent; color: var(--t2);
      transition: all 0.15s; display: flex; align-items: center; gap: 5px;
    }
    .nav-link:hover { background: var(--surface2); color: var(--t1); }
    .nav-link.active { color: var(--gold); }
    .nav-right { display: flex; align-items: center; gap: 8px; }
    .nav-status {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
      border: 1px solid; cursor: pointer; transition: all 0.2s;
    }
    .nav-status.online { color: var(--green); border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); }
    .nav-status.offline { color: var(--red); border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.08); }
    .nav-status.checking { color: var(--t3); border-color: var(--border2); background: transparent; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .status-dot.pulse { animation: pulse 1.5s ease infinite; }
    .nav-ham { display: none; background: none; border: none; cursor: pointer; color: var(--t1); padding: 4px; }

    /* ── HERO / HOME ── */
    .home { min-height: calc(100vh - 60px); display: grid; place-items: center; padding: 40px 24px; position: relative; z-index: 1; }
    .home-inner { max-width: 860px; width: 100%; }
    
    .hero-kicker {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 14px; border-radius: 20px;
      border: 1px solid var(--border); background: var(--gold-dim);
      font-size: 11px; font-weight: 600; color: var(--gold);
      letter-spacing: 0.08em; text-transform: uppercase;
      margin-bottom: 22px;
    }
    .hero-h1 {
      font-family: 'Libre Baskerville', serif;
      font-size: clamp(34px, 5.5vw, 58px);
      font-weight: 700; line-height: 1.08; color: var(--t1);
      margin-bottom: 18px; letter-spacing: -0.02em;
    }
    .hero-h1 em { color: var(--gold); font-style: italic; }
    .hero-p {
      font-size: 16px; color: var(--t2); line-height: 1.75;
      max-width: 520px; margin-bottom: 36px; font-weight: 300;
    }

    /* FORM */
    .form-shell {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px; padding: 28px;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow), var(--glow);
    }
    .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .fgroup { display: flex; flex-direction: column; gap: 5px; }
    .flabel { font-size: 11px; font-weight: 600; color: var(--t3); letter-spacing: 0.07em; text-transform: uppercase; }
    .finput, .fselect, .ftextarea {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border2);
      border-radius: var(--r2); color: var(--t1);
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 14px; padding: 9px 13px; width: 100%;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
      outline: none; appearance: none;
    }
    .finput:focus, .fselect:focus, .ftextarea:focus {
      border-color: var(--gold); background: rgba(200,169,110,0.05);
      box-shadow: 0 0 0 3px rgba(200,169,110,0.1);
    }
    .fselect option { background: #1a1814; }
    .ftextarea { resize: vertical; min-height: 120px; line-height: 1.65; }
    .ftextarea::placeholder { color: var(--t3); }
    
    .textarea-wrap { position: relative; margin-bottom: 14px; }
    .textarea-meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 6px;
    }
    .char-count { font-size: 11px; color: var(--t3); }
    .char-count.warn { color: var(--amber); }

    /* Quick examples */
    .quick-examples { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .quick-chip {
      padding: 4px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 500; cursor: pointer;
      border: 1px solid var(--border2); background: var(--surface);
      color: var(--t2); transition: all 0.15s;
    }
    .quick-chip:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }

    .cta {
      width: 100%; padding: 14px 24px;
      background: linear-gradient(135deg, var(--gold), var(--gold-d));
      border: none; border-radius: 11px;
      font-family: 'Libre Baskerville', serif;
      font-size: 15px; font-weight: 700; color: #1a1208;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s; letter-spacing: 0.01em;
      box-shadow: 0 4px 20px rgba(200,169,110,0.3);
    }
    .cta:hover:not(:disabled) { background: linear-gradient(135deg, var(--gold-l), #b88840); transform: translateY(-1px); box-shadow: 0 6px 28px rgba(200,169,110,0.4); }
    .cta:active:not(:disabled) { transform: translateY(0); }
    .cta:disabled { opacity: 0.45; cursor: not-allowed; }

    .disclaimer { margin-top: 12px; text-align: center; font-size: 11px; color: var(--t3); line-height: 1.6; }
    .disclaimer b { color: var(--gold); }

    /* Trust row */
    .trust-row { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 32px; padding-top: 28px; border-top: 1px solid var(--border); }
    .trust-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--t2); }
    .trust-item strong { color: var(--t1); }

    /* ── LOADING ── */
    .result-page { min-height: calc(100vh - 60px); padding: 28px 24px; position: relative; z-index: 1; }
    .result-inner { max-width: 980px; margin: 0 auto; }

    .loading-shell {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 460px; gap: 28px;
    }
    .loading-orb {
      width: 64px; height: 64px; border-radius: 50%; position: relative;
    }
    .loading-orb::before, .loading-orb::after {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
    }
    .loading-orb::before { border: 2px solid var(--border); }
    .loading-orb::after { border: 2px solid transparent; border-top-color: var(--gold); animation: spin 0.8s linear infinite; box-shadow: 0 0 16px rgba(200,169,110,0.3); }
    .loading-orb-inner {
      position: absolute; inset: 10px; border-radius: 50%;
      background: var(--gold-dim); display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .loading-title { font-family: 'Libre Baskerville', serif; font-size: 22px; font-weight: 700; }
    .pipeline-steps { display: flex; flex-direction: column; gap: 10px; width: 300px; }
    .pipeline-step {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 10px;
      border: 1px solid transparent; transition: all 0.4s;
      font-size: 13px;
    }
    .pipeline-step.waiting { color: var(--t3); }
    .pipeline-step.active { border-color: rgba(200,169,110,0.3); background: var(--gold-dim); color: var(--t1); }
    .pipeline-step.done { color: var(--green); }
    .pipeline-step-icon { font-size: 16px; width: 20px; text-align: center; }
    .pipeline-check { width: 16px; height: 16px; border-radius: 50%; background: var(--green); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* ── RESULT PAGE ── */
    .result-header { margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .result-title { font-family: 'Libre Baskerville', serif; font-size: 24px; font-weight: 700; }
    .result-sub { font-size: 13px; color: var(--t2); margin-top: 4px; display: flex; align-items: center; gap: 6px; }
    .result-grid { display: grid; grid-template-columns: 1.65fr 1fr; gap: 18px; }

    .back-btn {
      display: flex; align-items: center; gap: 6px;
      background: var(--surface); border: 1px solid var(--border2);
      border-radius: var(--r2); padding: 8px 14px;
      font-size: 13px; font-weight: 500; color: var(--t2);
      cursor: pointer; transition: all 0.15s;
    }
    .back-btn:hover { background: var(--surface3); color: var(--t1); border-color: var(--border); }

    /* CARDS */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r); padding: 22px;
      backdrop-filter: blur(10px);
    }
    .card + .card { margin-top: 16px; }
    .card-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 11px; font-weight: 700;
      color: var(--gold); letter-spacing: 0.08em;
      text-transform: uppercase;
      display: flex; align-items: center; gap: 7px;
    }
    .card-actions { display: flex; gap: 6px; }

    /* PETITION */
    .petition-area {
      font-size: 13px; line-height: 1.85; color: var(--t2);
      white-space: pre-wrap; font-family: 'IBM Plex Sans', sans-serif;
      max-height: 400px; overflow-y: auto; padding-right: 6px;
    }
    .petition-edit-area {
      width: 100%; background: rgba(255,255,255,0.03);
      border: 1px solid var(--gold); border-radius: var(--r2);
      color: var(--t1); font-family: 'IBM Plex Sans', sans-serif;
      font-size: 13px; line-height: 1.85; padding: 12px;
      resize: vertical; min-height: 360px; outline: none;
    }
    .action-bar { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
    .abtn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: var(--r2);
      font-size: 12px; font-weight: 600; font-family: 'IBM Plex Sans', sans-serif;
      cursor: pointer; transition: all 0.15s; border: 1px solid var(--border2);
      background: var(--surface); color: var(--t2); letter-spacing: 0.02em;
    }
    .abtn:hover { background: var(--surface3); color: var(--t1); border-color: var(--border); }
    .abtn.gold { background: var(--gold-dim); color: var(--gold); border-color: rgba(200,169,110,0.3); }
    .abtn.gold:hover { background: rgba(200,169,110,0.2); border-color: rgba(200,169,110,0.5); }
    .abtn.green { background: rgba(16,185,129,0.1); color: var(--green); border-color: rgba(16,185,129,0.3); }
    .abtn.whatsapp { background: rgba(37,211,102,0.1); color: #25d366; border-color: rgba(37,211,102,0.3); }
    .abtn.whatsapp:hover { background: rgba(37,211,102,0.2); }

    /* CLASSIFICATION */
    .conf-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 11px; color: var(--t3); }
    .severity-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 9px; border-radius: 4px; font-size: 11px; font-weight: 600;
      letter-spacing: 0.04em; text-transform: uppercase;
    }

    /* ENTITY TAGS */
    .ent-group { margin-bottom: 12px; }
    .ent-label { font-size: 10px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 5px; }
    .ent-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .ent-tag {
      font-size: 11px; padding: 3px 9px; border-radius: 5px;
      background: var(--surface2); border: 1px solid var(--border2);
      color: var(--t2);
    }

    /* COURT */
    .court-item { display: flex; gap: 11px; margin-bottom: 12px; }
    .court-icon-wrap { color: var(--gold); flex-shrink: 0; margin-top: 2px; }
    .court-key { font-size: 10px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; }
    .court-val { font-size: 13px; color: var(--t1); margin-top: 1px; line-height: 1.4; }

    /* NEXT STEPS */
    .step-accordion { display: flex; flex-direction: column; gap: 8px; }
    .step-acc-item {
      border: 1px solid var(--border2); border-radius: var(--r2); overflow: hidden;
      transition: border-color 0.15s;
    }
    .step-acc-item.open { border-color: rgba(200,169,110,0.3); }
    .step-acc-head {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      cursor: pointer; background: var(--surface); transition: background 0.15s;
    }
    .step-acc-head:hover { background: var(--surface2); }
    .step-num-badge {
      width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
      background: var(--gold-dim); border: 1px solid rgba(200,169,110,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--gold);
    }
    .step-acc-title { font-size: 13px; font-weight: 600; color: var(--t1); flex: 1; }
    .step-acc-dur { font-size: 11px; color: var(--t3); white-space: nowrap; }
    .step-acc-body { padding: 0 14px 12px 50px; font-size: 13px; color: var(--t2); line-height: 1.65; display: none; }
    .step-acc-item.open .step-acc-body { display: block; }

    .doc-checklist { display: flex; flex-direction: column; gap: 7px; margin-top: 8px; }
    .doc-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--t2); cursor: pointer; }
    .doc-checkbox {
      width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid var(--border);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: all 0.15s; background: transparent;
    }
    .doc-item.checked .doc-checkbox { background: var(--green); border-color: var(--green); }
    .doc-item.checked span { text-decoration: line-through; color: var(--t3); }

    .fee-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }
    .fee-card { background: var(--surface2); border-radius: var(--r2); padding: 10px; text-align: center; }
    .fee-label { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .fee-val { font-size: 13px; font-weight: 600; color: var(--gold); margin-top: 3px; }

    .tip-callout {
      display: flex; gap: 10px; padding: 12px 14px; border-radius: 10px;
      background: var(--gold-dim); border: 1px solid rgba(200,169,110,0.25);
      margin-top: 14px;
    }
    .tip-callout p { font-size: 13px; color: var(--t2); line-height: 1.6; }

    .helpline-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    .helpline-chip {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 11px; border-radius: 20px;
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25);
      font-size: 12px; color: #60a5fa; font-weight: 500;
    }

    /* FLAGGED BANNER */
    .flag-banner {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 12px 16px; border-radius: 10px; margin-bottom: 18px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
      font-size: 13px; color: #fca5a5;
    }

    /* ── HISTORY DRAWER ── */
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300;
      backdrop-filter: blur(4px); animation: fadeIn 0.2s;
    }
    .drawer {
      position: fixed; right: 0; top: 0; bottom: 0; width: 340px; z-index: 301;
      background: var(--ink2); border-left: 1px solid var(--border);
      display: flex; flex-direction: column; animation: slideInRight 0.25s ease;
    }
    .drawer-head {
      padding: 20px; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .drawer-title { font-family: 'Libre Baskerville', serif; font-size: 17px; font-weight: 700; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
    .hist-item {
      padding: 12px 14px; border-radius: 10px;
      border: 1px solid var(--border2); background: var(--surface);
      cursor: pointer; transition: all 0.15s;
    }
    .hist-item:hover { border-color: var(--border); background: var(--surface2); }
    .hist-cat { font-size: 11px; font-weight: 600; color: var(--gold); text-transform: uppercase; letter-spacing: 0.05em; }
    .hist-summary { font-size: 13px; color: var(--t1); margin-top: 3px; line-height: 1.4; }
    .hist-meta { font-size: 11px; color: var(--t3); margin-top: 4px; display: flex; gap: 8px; }
    .hist-empty { color: var(--t3); font-size: 13px; text-align: center; padding: 40px 0; }

    /* ── ADMIN ── */
    .admin-page { min-height: calc(100vh - 60px); padding: 28px 24px; position: relative; z-index: 1; }
    .admin-inner { max-width: 1120px; margin: 0 auto; }
    .admin-header { margin-bottom: 28px; }
    .admin-h1 { font-family: 'Libre Baskerville', serif; font-size: 26px; font-weight: 700; }
    .admin-sub { font-size: 13px; color: var(--t2); margin-top: 4px; }
    
    .tab-bar { display: flex; gap: 2px; padding: 4px; background: var(--surface); border: 1px solid var(--border2); border-radius: 10px; margin-bottom: 24px; width: fit-content; }
    .tab {
      padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 500;
      cursor: pointer; border: none; background: transparent; color: var(--t2);
      transition: all 0.15s;
    }
    .tab.active { background: var(--surface3); color: var(--t1); }

    .stats-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    .stat-box {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r); padding: 18px;
    }
    .stat-box-label { font-size: 11px; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
    .stat-box-val { font-family: 'Libre Baskerville', serif; font-size: 30px; font-weight: 700; color: var(--t1); line-height: 1; }
    .stat-box-sub { font-size: 12px; color: var(--t2); margin-top: 5px; display: flex; align-items: center; gap: 4px; }
    .stat-trend { color: var(--green); font-weight: 600; }

    .dual-chart { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 20px; }

    /* BAR CHART */
    .chart-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 20px; }
    .chart-box-title { font-family: 'Libre Baskerville', serif; font-size: 15px; font-weight: 700; margin-bottom: 18px; }
    .bar-chart { display: flex; gap: 10px; align-items: flex-end; height: 130px; }
    .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .bar {
      width: 100%; border-radius: 5px 5px 0 0; min-height: 4px;
      background: linear-gradient(180deg, var(--gold) 0%, rgba(200,169,110,0.35) 100%);
      transition: height 1.2s cubic-bezier(0.4,0,0.2,1);
      cursor: pointer; position: relative;
    }
    .bar:hover { filter: brightness(1.2); }
    .bar-val { font-size: 10px; font-weight: 600; color: var(--t2); }
    .bar-label { font-size: 9px; color: var(--t3); text-align: center; line-height: 1.3; }

    /* LINE CHART (monthly) */
    .line-chart-wrap { padding-top: 8px; }

    /* DONUT */
    .donut-wrap { display: flex; align-items: center; gap: 16px; }
    .donut-legend { display: flex; flex-direction: column; gap: 6px; }
    .legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--t2); }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    /* TABLE */
    .table-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
    .table-toolbar {
      padding: 16px 20px; border-bottom: 1px solid var(--border2);
      display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }
    .table-search {
      flex: 1; min-width: 200px; max-width: 300px;
      background: var(--surface2); border: 1px solid var(--border2);
      border-radius: var(--r2); color: var(--t1);
      font-family: 'IBM Plex Sans', sans-serif; font-size: 13px;
      padding: 7px 12px; outline: none;
    }
    .table-search:focus { border-color: var(--gold); }
    .filter-pills { display: flex; gap: 5px; }
    .filter-pill {
      padding: 5px 11px; border-radius: 20px; font-size: 11px; font-weight: 600;
      cursor: pointer; border: 1px solid var(--border2); background: transparent;
      color: var(--t2); transition: all 0.15s;
    }
    .filter-pill.active { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
    .tbl { width: 100%; border-collapse: collapse; }
    .tbl th { padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 700; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border2); background: rgba(255,255,255,0.015); white-space: nowrap; }
    .tbl td { padding: 13px 16px; font-size: 13px; color: var(--t2); border-bottom: 1px solid rgba(255,255,255,0.035); vertical-align: middle; }
    .tbl tr:last-child td { border-bottom: none; }
    .tbl tr:hover td { background: rgba(255,255,255,0.02); }
    .tbl td:first-child { font-weight: 600; color: var(--gold); font-size: 12px; letter-spacing: 0.03em; }
    .case-problem { font-size: 12px; color: var(--t3); margin-top: 2px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── TOASTS ── */
    .toast-stack { position: fixed; bottom: 24px; right: 24px; z-index: 500; display: flex; flex-direction: column; gap: 8px; }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px; min-width: 260px;
      font-size: 13px; font-weight: 500; backdrop-filter: blur(16px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: slideInRight 0.25s ease;
    }
    .toast.success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.35); color: #6ee7b7; }
    .toast.error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
    .toast.info { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; }
    .toast-icon { font-size: 16px; }

    /* ── TOOLTIP ── */
    .tooltip-wrap:hover .tooltip { opacity: 1; pointer-events: auto; transform: translateY(-4px); }
    .tooltip {
      position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%) translateY(0);
      white-space: nowrap; font-size: 11px; color: var(--t1);
      background: rgba(30,28,24,0.95); border: 1px solid var(--border);
      padding: 4px 9px; border-radius: 5px;
      opacity: 0; pointer-events: none; transition: all 0.15s; z-index: 50;
    }

    /* ── KEYFRAMES ── */
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInRight { from { transform: translateX(32px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    
    .slide-up { animation: slideUp 0.35s ease forwards; }
    .slide-up-1 { animation: slideUp 0.35s 0.05s ease both; }
    .slide-up-2 { animation: slideUp 0.35s 0.1s ease both; }
    .slide-up-3 { animation: slideUp 0.35s 0.15s ease both; }
    .slide-up-4 { animation: slideUp 0.35s 0.2s ease both; }

    /* ── MOBILE ── */
    @media (max-width: 768px) {
      .form-row-3 { grid-template-columns: 1fr 1fr; }
      .result-grid { grid-template-columns: 1fr; }
      .stats-4 { grid-template-columns: 1fr 1fr; }
      .dual-chart { grid-template-columns: 1fr; }
      .nav-center { display: none; }
      .nav-center.open {
        display: flex; flex-direction: column;
        position: absolute; top: 60px; left: 0; right: 0;
        background: rgba(12,11,9,0.98); border-bottom: 1px solid var(--border);
        padding: 12px; gap: 4px; z-index: 150;
      }
      .nav-ham { display: flex; }
      .nav-right .nav-status span:last-child { display: none; }
      .drawer { width: 100%; }
      .fee-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .form-row-3 { grid-template-columns: 1fr; }
      .stats-4 { grid-template-columns: 1fr 1fr; }
      .home { padding: 24px 16px; }
      .form-shell { padding: 18px; }
    }
  `;

  // ── Severity display ──────────────────────────────────────────────────────
  const severityStyle = {
    low: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.25)" },
    medium: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    high: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.25)" },
    urgent: { bg: "rgba(239,68,68,0.18)", color: "#fca5a5", border: "rgba(239,68,68,0.4)" },
  };

  // ── Document checklist state ──────────────────────────────────────────────
  const [checkedDocs, setCheckedDocs] = useState({});
  const toggleDoc = (i) => setCheckedDocs(prev => ({ ...prev, [i]: !prev[i] }));

  // ── Render functions ──────────────────────────────────────────────────────

  const renderHome = () => (
    <div className="home">
      <div className="home-inner">
        <div className="hero-kicker slide-up">
          {Icons.shield(12)} Free Legal Aid Platform for India
        </div>
        <h1 className="hero-h1 slide-up-1">
          Your legal rights,<br/><em>explained & enforced</em>
        </h1>
        <p className="hero-p slide-up-2">
          Describe your problem in plain language. NyayaSetu classifies it, finds the right court, drafts a formal petition, and guides you step by step — powered by local AI.
        </p>

        <div className="form-shell slide-up-3">
          {/* Quick examples */}
          <div className="fgroup" style={{ marginBottom: 6 }}>
            <div className="flabel">Quick start — try an example</div>
          </div>
          <div className="quick-examples">
            {QUICK_EXAMPLES.map((ex, i) => (
              <button key={i} className="quick-chip" onClick={() => {
                setFormData(f => ({ ...f, problem: ex.text }));
                setCharCount(ex.text.length);
              }}>{ex.label}</button>
            ))}
          </div>

          <div className="textarea-wrap">
            <div className="flabel" style={{ marginBottom: 5 }}>Describe your legal problem</div>
            <textarea
              className="ftextarea"
              placeholder="Describe your situation in detail. Include names, dates, amounts, and what you want as an outcome. More details = better petition."
              value={formData.problem}
              maxLength={2000}
              onChange={(e) => { setFormData(f => ({ ...f, problem: e.target.value })); setCharCount(e.target.value.length); }}
            />
            <div className="textarea-meta">
              <span style={{ fontSize: 11, color: "var(--t3)" }}>{countWords(formData.problem)} words</span>
              <span className={`char-count ${charCount > 1800 ? "warn" : ""}`}>{charCount}/2000</span>
            </div>
          </div>

          <div className="form-row-3">
            <div className="fgroup">
              <label className="flabel">Language</label>
              <select className="fselect" value={formData.language} onChange={e => setFormData(f => ({ ...f, language: e.target.value }))}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native} — {l.label}</option>)}
              </select>
            </div>
            <div className="fgroup">
              <label className="flabel">State</label>
              <select className="fselect" value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value, district: "" }))}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fgroup">
              <label className="flabel">District</label>
              <select className="fselect" value={formData.district} onChange={e => setFormData(f => ({ ...f, district: e.target.value }))} disabled={!formData.state}>
                <option value="">Select district</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button className="cta" onClick={handleSubmit}
            disabled={!formData.problem.trim() || !formData.state || !formData.district || loading}>
            {Icons.send(15)}
            Get Free Legal Help
          </button>

          <p className="disclaimer"><b>⚖ Disclaimer:</b> AI-assisted only. Not legal advice. Consult a qualified advocate for complex matters.</p>
        </div>

        <div className="trust-row slide-up-4">
          {[
            { icon: Icons.globe(14), label: <><strong>6 languages</strong> supported</> },
            { icon: Icons.file(14), label: <><strong>AI petition</strong> drafting</> },
            { icon: Icons.pin(14), label: <><strong>Court finder</strong> by location</> },
            { icon: Icons.shield(14), label: <><strong>100% free</strong> to use</> },
            { icon: Icons.zap(14), label: <><strong>Local AI</strong> — fully private</> },
          ].map((t, i) => (
            <div key={i} className="trust-item">
              <span style={{ color: "var(--gold)" }}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="result-page">
      <div className="result-inner">
        <div className="loading-shell">
          <div className="loading-orb">
            <div className="loading-orb-inner">⚖</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="loading-title">Processing your case</div>
            <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 6 }}>
              {PIPELINE_STEPS[currentStep]?.label || "Finalising…"}
            </div>
          </div>
          <div className="pipeline-steps">
            {PIPELINE_STEPS.map((step, i) => {
              const isDone = loadingSteps.includes(i) && currentStep > i;
              const isActive = currentStep === i;
              return (
                <div key={i} className={`pipeline-step ${isDone ? "done" : isActive ? "active" : "waiting"}`}>
                  <span className="pipeline-step-icon">
                    {isDone ? <div className="pipeline-check">{Icons.check(10)}</div> : step.icon}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
          <ProgressBar value={(currentStep / PIPELINE_STEPS.length) * 100} color="var(--gold)" />
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    if (result.error) return (
      <div className="result-page">
        <div className="result-inner" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360 }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fca5a5", marginBottom: 8 }}>Generation Failed</div>
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65, marginBottom: 20 }}>{result.error}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="back-btn" onClick={() => { setPage("home"); setResult(null); }}>{Icons.back(14)} Start Over</button>
              <button className="abtn" onClick={checkOllama}>{Icons.refresh(14)} Check Ollama</button>
            </div>
          </div>
        </div>
      </div>
    );

    const { classification, courtInfo, petition, nextSteps } = result;
    const confPct = Math.round((classification?.confidence || 0.85) * 100);
    const entities = classification?.entities || {};
    const hasEnt = (arr) => arr?.length > 0 && arr[0]?.trim();
    const catMeta = CATEGORY_META[classification?.category] || CATEGORY_META.Other;
    const sevStyle = severityStyle[classification?.severity || "medium"];
    const displayPetition = petitionEdit ? editedPetition : petition;

    return (
      <div className="result-page slide-up">
        <div className="result-inner">
          {/* Header */}
          <div className="result-header">
            <div>
              <h1 className="result-title">Your Legal Aid Package</h1>
              <div className="result-sub">
                {Icons.pin(13)} {formData.district}, {formData.state} ·
                {Icons.globe(13)} {LANGUAGES.find(l => l.code === formData.language)?.native}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="abtn" onClick={() => setShowHistory(true)}>{Icons.clock(13)} History</button>
              <button className="back-btn" onClick={() => { setPage("home"); setResult(null); setPetitionEdit(false); }}>{Icons.back(14)} Start Over</button>
            </div>
          </div>

          {/* Flagged banner */}
          {classification?.flagged && (
            <div className="flag-banner">
              {Icons.alert(16)}
              <div>
                <strong>Low AI confidence — flagged for review.</strong> We recommend consulting a legal professional via NALSA (15100) before filing.
                {classification.urgency_note && <div style={{ marginTop: 4, opacity: 0.8 }}>{classification.urgency_note}</div>}
              </div>
            </div>
          )}

          <div className="result-grid">
            {/* ─── LEFT ─── */}
            <div>
              {/* Petition */}
              <div className="card slide-up-1">
                <div className="card-head">
                  <div className="card-title">{Icons.file(13)} Legal Petition Draft</div>
                  <div className="card-actions">
                    <button className={`abtn ${petitionEdit ? "gold" : ""}`} onClick={() => setPetitionEdit(!petitionEdit)}>
                      {petitionEdit ? <>{Icons.check(12)} Done</> : <>✏ Edit</>}
                    </button>
                  </div>
                </div>
                {petitionEdit ? (
                  <textarea
                    className="petition-edit-area"
                    value={editedPetition}
                    onChange={e => setEditedPetition(e.target.value)}
                  />
                ) : (
                  <pre className="petition-area">{displayPetition}</pre>
                )}
                <div className="action-bar">
                  <button className="abtn gold" onClick={handleCopy}>{Icons[copied ? "check" : "copy"](13)} {copied ? "Copied!" : "Copy"}</button>
                  <button className="abtn" onClick={handleDownload}>{Icons.download(13)} Download .txt</button>
                  <button className="abtn whatsapp" onClick={handleWhatsApp}>{Icons.whatsapp(13)} Share</button>
                </div>
              </div>

              {/* Next Steps */}
              {nextSteps && (
                <div className="card slide-up-2">
                  <div className="card-title" style={{ marginBottom: 14 }}>{Icons.chevron(13, "right")} Step-by-Step Guide</div>
                  <div className="step-accordion">
                    {nextSteps.steps?.map((step, i) => (
                      <div key={i} className={`step-acc-item ${expandedStep === i ? "open" : ""}`}>
                        <div className="step-acc-head" onClick={() => setExpandedStep(expandedStep === i ? null : i)}>
                          <div className="step-num-badge">{i + 1}</div>
                          <span className="step-acc-title">{step.title}</span>
                          <span className="step-acc-dur">{step.duration}</span>
                          {Icons.chevron(14, expandedStep === i ? "down" : "right")}
                        </div>
                        <div className="step-acc-body">{step.description}</div>
                      </div>
                    ))}
                  </div>

                  {/* Document checklist */}
                  {nextSteps.documents?.length > 0 && (
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border2)" }}>
                      <div className="card-title" style={{ marginBottom: 10 }}>{Icons.check(12)} Document Checklist</div>
                      <div className="doc-checklist">
                        {nextSteps.documents.map((doc, i) => (
                          <div key={i} className={`doc-item ${checkedDocs[i] ? "checked" : ""}`} onClick={() => toggleDoc(i)}>
                            <div className="doc-checkbox">{checkedDocs[i] && Icons.check(9)}</div>
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fee breakdown */}
                  {nextSteps.fees && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border2)" }}>
                      <div className="card-title" style={{ marginBottom: 8 }}>💰 Estimated Costs</div>
                      <div className="fee-grid">
                        <div className="fee-card"><div className="fee-label">Filing Fee</div><div className="fee-val">{nextSteps.fees.filing}</div></div>
                        <div className="fee-card"><div className="fee-label">Affidavit</div><div className="fee-val">{nextSteps.fees.affidavit}</div></div>
                        <div className="fee-card"><div className="fee-label">Advocate</div><div className="fee-val">{nextSteps.fees.advocate}</div></div>
                      </div>
                    </div>
                  )}

                  {/* Helplines */}
                  {nextSteps.helplines?.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border2)" }}>
                      <div className="card-title" style={{ marginBottom: 8 }}>📞 Helplines</div>
                      <div className="helpline-row">
                        {nextSteps.helplines.map((h, i) => (
                          <div key={i} className="helpline-chip">{Icons.globe(12)} {h.name}: <strong>{h.number}</strong></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {nextSteps.tip && (
                    <div className="tip-callout">
                      {Icons.star(14)}
                      <p><strong style={{ color: "var(--gold)" }}>Pro Tip:</strong> {nextSteps.tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── RIGHT ─── */}
            <div>
              {/* Classification */}
              <div className="card slide-up-1">
                <div className="card-title" style={{ marginBottom: 14 }}>{Icons.scale(13)} Case Analysis</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <Badge meta={catMeta}>{classification?.category}</Badge>
                  <span className="severity-tag" style={{ background: sevStyle.bg, color: sevStyle.color, border: `1px solid ${sevStyle.border}` }}>
                    {classification?.severity || "medium"}
                  </span>
                </div>
                <div className="conf-row"><span>AI Confidence</span><span style={{ color: confPct >= 70 ? "var(--gold)" : "var(--red)", fontWeight: 700 }}>{confPct}%</span></div>
                <ProgressBar value={confPct} color={confPct >= 70 ? "var(--gold)" : "var(--red)"} />
                {classification?.summary && <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65, margin: "12px 0" }}>{classification.summary}</p>}
                {classification?.urgency_note && <p style={{ fontSize: 12, color: "var(--amber)", marginBottom: 10, lineHeight: 1.5 }}>⚡ {classification.urgency_note}</p>}
                {hasEnt(entities.names) && <div className="ent-group"><div className="ent-label">Persons</div><div className="ent-tags">{entities.names.map((n, i) => <span key={i} className="ent-tag">{n}</span>)}</div></div>}
                {hasEnt(entities.amounts) && <div className="ent-group"><div className="ent-label">Amounts</div><div className="ent-tags">{entities.amounts.map((a, i) => <span key={i} className="ent-tag">{a}</span>)}</div></div>}
                {hasEnt(entities.dates) && <div className="ent-group"><div className="ent-label">Dates</div><div className="ent-tags">{entities.dates.map((d, i) => <span key={i} className="ent-tag">{d}</span>)}</div></div>}
                {hasEnt(entities.locations) && <div className="ent-group"><div className="ent-label">Locations</div><div className="ent-tags">{entities.locations.map((l, i) => <span key={i} className="ent-tag">{l}</span>)}</div></div>}
              </div>

              {/* Court */}
              <div className="card slide-up-2">
                <div className="card-title" style={{ marginBottom: 14 }}>{Icons.pin(13)} Court Details</div>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{courtInfo?.icon}</div>
                {[
                  { icon: Icons.scale(13), key: "Court", val: courtInfo?.name },
                  { icon: Icons.pin(13), key: "Address", val: courtInfo?.address },
                  { icon: Icons.file(13), key: "Filing Fee", val: courtInfo?.filingFee },
                  { icon: Icons.globe(13), key: "Contact", val: courtInfo?.contact },
                  { icon: Icons.clock(13), key: "Timeline", val: courtInfo?.timeline },
                ].map((row, i) => (
                  <div key={i} className="court-item">
                    <span className="court-icon-wrap">{row.icon}</span>
                    <div><div className="court-key">{row.key}</div><div className="court-val">{row.val}</div></div>
                  </div>
                ))}
              </div>

              {/* Legal Aid Box */}
              <div className="card slide-up-3" style={{ background: "var(--gold-dim)", borderColor: "rgba(200,169,110,0.2)", marginTop: 16 }}>
                <div className="card-title" style={{ marginBottom: 10 }}>{Icons.shield(13)} Free Legal Aid</div>
                <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>
                  NALSA Helpline: <strong style={{ color: "var(--t1)" }}>15100</strong><br/>
                  Women Helpline: <strong style={{ color: "var(--t1)" }}>181</strong><br/>
                  DLSA provides free representation to eligible citizens.
                </p>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(200,169,110,0.2)", fontSize: 12, color: "var(--t3)" }}>
                  Powered by Ollama · {OLLAMA_MODEL} · 100% Local & Private
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdmin = () => {
    const maxCat = Math.max(...Object.values(ADMIN_STATS.byCategory));
    const DONUT_COLORS = ["#c8a96e","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444","#f87171","#60a5fa"];
    const topCats = Object.entries(ADMIN_STATS.byCategory).slice(0, 5);
    const totalPetitions = ADMIN_STATS.total;

    return (
      <div className="admin-page slide-up">
        <div className="admin-inner">
          <div className="admin-header">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 className="admin-h1">Admin Dashboard</h1>
                <p className="admin-sub">Platform analytics, flagged cases, and case management</p>
              </div>
              <button className="abtn" onClick={checkOllama}>{Icons.refresh(13)} Refresh Ollama Status</button>
            </div>
          </div>

          <div className="tab-bar">
            {["overview","cases","analytics"].map(t => (
              <button key={t} className={`tab ${adminTab === t ? "active" : ""}`} onClick={() => setAdminTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {adminTab === "overview" && <>
            <div className="stats-4">
              {[
                { label: "Total Petitions", val: ADMIN_STATS.total.toLocaleString(), sub: "+14% vs last month", trend: true },
                { label: "Flagged", val: ADMIN_STATS.pending, sub: "Confidence < 70%", trend: false },
                { label: "Resolved", val: ADMIN_STATS.resolved.toLocaleString(), sub: "96.3% completion rate", trend: true },
                { label: "Avg Confidence", val: `${ADMIN_STATS.avgConfidence}%`, sub: "Platform average", trend: true },
              ].map((s, i) => (
                <div key={i} className="stat-box slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="stat-box-label">{s.label}</div>
                  <div className="stat-box-val">{s.val}</div>
                  {s.trend && <div className="stat-box-sub"><span className="stat-trend">↑</span>{s.sub}</div>}
                  {!s.trend && <div className="stat-box-sub" style={{ color: "var(--red)" }}>{s.sub}</div>}
                </div>
              ))}
            </div>

            <div className="dual-chart">
              {/* Category bars */}
              <div className="chart-box">
                <div className="chart-box-title">Cases by Category</div>
                <div className="bar-chart">
                  {Object.entries(ADMIN_STATS.byCategory).map(([cat, val], i) => (
                    <div key={cat} className="bar-wrap">
                      <div className="bar-val">{val}</div>
                      <div className="bar" style={{ height: `${(val / maxCat) * 100}%` }} title={`${cat}: ${val}`} />
                      <div className="bar-label">{cat.split(" ").map(w => w.slice(0, 4)).join("\n")}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top categories donut-style */}
              <div className="chart-box">
                <div className="chart-box-title">Category Distribution</div>
                <div className="donut-wrap">
                  <svg width="110" height="110" viewBox="0 0 36 36">
                    {topCats.reduce((acc, [cat, val], i) => {
                      const pct = (val / totalPetitions) * 100;
                      const dash = (pct / 100) * 100;
                      const offset = acc.offset;
                      acc.elements.push(
                        <circle key={cat} cx="18" cy="18" r="15.9"
                          fill="transparent" stroke={DONUT_COLORS[i]}
                          strokeWidth="3.5" strokeDasharray={`${dash} ${100 - dash}`}
                          strokeDashoffset={-offset}
                          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                        />
                      );
                      acc.offset += dash;
                      return acc;
                    }, { elements: [], offset: 0 }).elements}
                    <text x="18" y="22" textAnchor="middle" fill="var(--t1)" fontSize="6" fontWeight="bold">1,284</text>
                  </svg>
                  <div className="donut-legend">
                    {topCats.map(([cat, val], i) => (
                      <div key={cat} className="legend-item">
                        <div className="legend-dot" style={{ background: DONUT_COLORS[i] }} />
                        <span>{cat}: <strong style={{ color: "var(--t1)" }}>{val}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly trend */}
            <div className="chart-box" style={{ marginBottom: 20 }}>
              <div className="chart-box-title">Monthly Petitions (2025)</div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
                {ADMIN_STATS.monthly.map((v, i) => {
                  const max = Math.max(...ADMIN_STATS.monthly);
                  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 600 }}>{v}</div>
                      <div style={{ width: "100%", height: `${(v / max) * 100}%`, borderRadius: "4px 4px 0 0", background: i === 11 ? "var(--gold)" : "rgba(200,169,110,0.4)", minHeight: 4, transition: "height 1s" }} />
                      <div style={{ fontSize: 9, color: "var(--t3)" }}>{months[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>}

          {adminTab === "cases" && (
            <div className="table-box">
              <div className="table-toolbar">
                <input className="table-search" placeholder="Search by ID, category, location…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <div className="filter-pills">
                  {["all","Flagged","Under Review","Resolved"].map(s => (
                    <button key={s} className={`filter-pill ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr><th>Case ID</th><th>Category</th><th>Problem</th><th>Location</th><th>Date</th><th>Confidence</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filteredCases.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--t3)", padding: "28px" }}>No cases match your filter.</td></tr>
                    ) : filteredCases.map((c) => {
                      const meta = CATEGORY_META[c.category] || CATEGORY_META.Other;
                      return (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td><Badge meta={meta}>{c.category}</Badge></td>
                          <td><div style={{ color: "var(--t1)", fontWeight: 500, fontSize: 13 }}>{c.district}</div><div className="case-problem">{c.problem}</div></td>
                          <td style={{ color: "var(--t2)" }}>{c.district}</td>
                          <td style={{ color: "var(--t3)" }}>{c.date}</td>
                          <td style={{ color: c.confidence < 70 ? "var(--red)" : "var(--gold)", fontWeight: 700 }}>{c.confidence}%</td>
                          <td>
                            <Badge meta={c.status === "Resolved" ? { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" } : c.status === "Under Review" ? { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" } : { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" }}>
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === "analytics" && (
            <div>
              <div className="chart-box" style={{ marginBottom: 16 }}>
                <div className="chart-box-title">AI Confidence Distribution</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {[
                    { label: "High (90–100%)", count: 412, color: "var(--green)" },
                    { label: "Good (70–89%)", count: 684, color: "var(--gold)" },
                    { label: "Low (<70%)", count: 188, color: "var(--red)" },
                  ].map((band, i) => (
                    <div key={i} style={{ flex: 1, padding: 16, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border2)", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: band.color, fontFamily: "'Libre Baskerville', serif" }}>{band.count}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{band.label}</div>
                      <div style={{ marginTop: 8 }}><ProgressBar value={(band.count / ADMIN_STATS.total) * 100} color={band.color} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-box">
                <div className="chart-box-title">State-wise Cases (Top 6)</div>
                {[
                  { state: "Maharashtra", count: 234 }, { state: "Uttar Pradesh", count: 198 },
                  { state: "Telangana", count: 176 }, { state: "Tamil Nadu", count: 154 },
                  { state: "Karnataka", count: 141 }, { state: "West Bengal", count: 112 },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span style={{ color: "var(--t1)" }}>{s.state}</span>
                      <span style={{ color: "var(--t3)", fontWeight: 600 }}>{s.count}</span>
                    </div>
                    <ProgressBar value={(s.count / 234) * 100} color="var(--gold)" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-brand" onClick={() => navigate("home")}>
            <div className="nav-emblem">⚖</div>
            <div>
              <div className="nav-name">NyayaSetu</div>
              <div className="nav-tagline">AI Legal Aid</div>
            </div>
          </div>

          <div className={`nav-center ${mobileMenu ? "open" : ""}`}>
            {[
              { label: "Home", pg: "home" },
              { label: "Admin", pg: "admin" },
            ].map(n => (
              <button key={n.pg} className={`nav-link ${page === n.pg ? "active" : ""}`} onClick={() => navigate(n.pg)}>{n.label}</button>
            ))}
            <button className="nav-link" onClick={() => setShowHistory(true)}>
              {Icons.clock(13)} History {history.length > 0 && <span style={{ background: "var(--gold)", color: "#1a1208", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{history.length}</span>}
            </button>
          </div>

          <div className="nav-right">
            <Tooltip text={ollamaStatus === "online" ? "Ollama is running" : ollamaStatus === "offline" ? "Ollama is offline" : "Checking Ollama…"}>
              <button className={`nav-status ${ollamaStatus}`} onClick={checkOllama}>
                <div className={`status-dot ${ollamaStatus === "checking" ? "pulse" : ""}`} />
                <span>{ollamaStatus === "online" ? "Ollama Online" : ollamaStatus === "offline" ? "Ollama Offline" : "Checking…"}</span>
              </button>
            </Tooltip>
            <button className="nav-ham" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? Icons.x(22) : Icons.menu(22)}
            </button>
          </div>
        </nav>

        {/* PAGES */}
        {page === "home" && renderHome()}
        {page === "result" && (loading ? renderLoading() : renderResult())}
        {page === "admin" && renderAdmin()}

        {/* HISTORY DRAWER */}
        {showHistory && (
          <>
            <div className="drawer-overlay" onClick={() => setShowHistory(false)} />
            <div className="drawer">
              <div className="drawer-head">
                <div className="drawer-title">Case History</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {history.length > 0 && (
                    <button className="abtn" style={{ fontSize: 11 }} onClick={() => { HistoryManager.clear(); setHistory([]); }}>Clear</button>
                  )}
                  <button className="abtn" onClick={() => setShowHistory(false)}>{Icons.x(14)}</button>
                </div>
              </div>
              <div className="drawer-body">
                {history.length === 0 ? (
                  <div className="hist-empty">No cases yet. Generate your first petition!</div>
                ) : history.map((h, i) => {
                  const meta = CATEGORY_META[h.category] || CATEGORY_META.Other;
                  return (
                    <div key={h.id} className="hist-item">
                      <div className="hist-cat">{h.category}</div>
                      <div className="hist-summary">{h.summary}</div>
                      <div className="hist-meta">
                        <span>{h.district}, {h.state}</span>
                        <span>·</span>
                        <span>{Math.round(h.confidence * 100)}% confidence</span>
                        <span>·</span>
                        <span>{h.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* TOASTS */}
        <div className="toast-stack">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span className="toast-icon">
                {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
              </span>
              {t.msg}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
