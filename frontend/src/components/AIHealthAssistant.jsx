import React, { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Brain,
  ShieldAlert,
  Stethoscope,
  UserRound,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/* ─── inline styles (no extra CSS file needed) ─── */
const styles = `
  * { box-sizing: border-box; }

  body, .medi-root { font-family: var(--bs-font-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif); }

  .medi-root {
    min-height: 100vh;
    background: #f0f4ff;
    padding: 24px 16px;
  }

  /* ── sidebar ── */
  .sidebar {
    background: linear-gradient(160deg, #1d4ed8 0%, #4338ca 100%);
    border-radius: 20px;
    padding: 32px 28px;
    color: #fff;
    height: 100%;
  }
  .sidebar-brand { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; }
  .sidebar-icon-wrap {
    width: 60px; height: 60px; border-radius: 16px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sidebar-brand h2 { font-size: 1.5rem; font-weight: 700; margin: 0 0 2px; }
  .sidebar-brand p  { margin: 0; font-size: 0.85rem; opacity: 0.85; }

  .feature-card {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 14px;
    padding: 18px;
    display: flex; gap: 14px;
    margin-bottom: 14px;
  }
  .feature-card h6 { font-size: 0.95rem; font-weight: 600; margin: 0 0 4px; }
  .feature-card p  { font-size: 0.8rem; opacity: 0.85; margin: 0; line-height: 1.5; }

  .disclaimer-box {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex; gap: 12px; align-items: flex-start;
    margin-top: 28px;
    font-size: 0.8rem; opacity: 0.9; line-height: 1.5;
  }

  /* ── form card ── */
  .form-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(30,40,100,0.07);
    padding: 28px 28px 32px;
    margin-bottom: 24px;
  }
  .form-card h2 { font-size: 1.55rem; font-weight: 700; margin: 0 0 4px; }
  .form-card .sub { color: #6b7280; font-size: 0.88rem; margin: 0 0 24px; }

  .ai-badge {
    background: #fef3c7; color: #92400e;
    font-size: 0.75rem; font-weight: 600;
    padding: 5px 14px; border-radius: 999px;
    white-space: nowrap; align-self: flex-start;
  }

  .form-row { display: flex; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
  .form-row > * { flex: 1 1 160px; }

  .medi-input, .medi-select, .medi-textarea {
    width: 100%; border: 1.5px solid #e5e7eb;
    border-radius: 10px; padding: 12px 14px;
    font-size: 0.92rem;
    color: #111827; background: #fff;
    transition: border-color 0.2s;
    outline: none;
  }
  .medi-input:focus, .medi-select:focus, .medi-textarea:focus { border-color: #2563eb; }
  .medi-textarea { resize: vertical; min-height: 120px; }

  .analyze-btn {
    width: 100%; margin-top: 18px;
    background: linear-gradient(135deg, #2563eb, #4338ca);
    color: #fff; border: none; border-radius: 12px;
    padding: 14px; font-size: 0.97rem; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s, transform 0.15s;
  }
  .analyze-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .analyze-btn:not(:disabled):hover { opacity: 0.92; transform: translateY(-1px); }

  /* ── response section ── */
  .response-grid { display: flex; flex-direction: column; gap: 20px; }

  .res-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(30,40,100,0.06);
    overflow: hidden;
  }
  .res-card-body { padding: 24px 28px; }
  .res-card h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 4px; }
  .res-card h4 { font-size: 1.1rem; font-weight: 700; margin: 0 0 16px; }

  /* urgency badge */
  .urgency-high     { background:#fee2e2; color:#dc2626; }
  .urgency-moderate { background:#fef9c3; color:#ca8a04; }
  .urgency-low      { background:#dcfce7; color:#16a34a; }
  .urgency-badge {
    font-size: 0.78rem; font-weight: 700; padding: 5px 14px;
    border-radius: 999px; white-space: nowrap;
  }

  /* summary */
  .summary-text { color: #374151; line-height: 1.7; font-size: 0.93rem; margin: 0 0 20px; }

  .specialist-pill {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #2563eb, #4338ca);
    color: #fff; border-radius: 14px; padding: 14px 20px;
    width: 100%;
  }
  .specialist-pill .label { font-size: 0.75rem; opacity: 0.8; }
  .specialist-pill .value { font-size: 1rem; font-weight: 600; }

  /* conditions */
  .conditions-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .condition-tag {
    background: #eff6ff; color: #1d4ed8;
    font-size: 0.82rem; font-weight: 500;
    padding: 6px 16px; border-radius: 999px;
    border: 1px solid #bfdbfe;
  }

  /* precautions & emergency lists */
  .medi-list { list-style: none; margin: 0; padding: 0; }
  .medi-list li {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 9px 0; border-bottom: 1px solid #f3f4f6;
    font-size: 0.9rem; line-height: 1.5; color: #374151;
  }
  .medi-list li:last-child { border-bottom: none; }
  .medi-list li::before { content: "•"; color: #2563eb; font-size: 1.1rem; margin-top: -1px; flex-shrink: 0; }

  .emergency-card { background: #fff5f5; border: 1.5px solid #fecaca; }
  .emergency-list li { color: #dc2626; border-bottom-color: #fee2e2; }
  .emergency-list li::before { color: #dc2626; }

  /* doctors grid */
  .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .doctor-card {
    border: 1.5px solid #e5e7eb; border-radius: 16px;
    padding: 20px; display: flex; flex-direction: column; gap: 0;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .doctor-card:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.1); border-color: #bfdbfe; }
  .doctor-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
  .doctor-top img { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
  .doctor-top h5 { font-size: 0.97rem; font-weight: 700; margin: 0 0 3px; }
  .doctor-top p  { font-size: 0.82rem; color: #2563eb; font-weight: 600; margin: 0; }
  .doctor-meta { font-size: 0.82rem; color: #6b7280; margin-bottom: 16px; }
  .doctor-meta p { margin: 0 0 5px; display: flex; gap: 4px; }
  .doctor-meta strong { color: #374151; }
  .book-btn {
    margin-top: auto; background: #eff6ff; color: #1d4ed8;
    border: 1.5px solid #bfdbfe; border-radius: 10px;
    padding: 10px; font-weight: 600; font-size: 0.87rem;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .book-btn:hover { background: #2563eb; color: #fff; border-color: #2563eb; }

  /* disclaimer alert */
  .disclaimer-alert {
    background: #fffbeb; border: 1.5px solid #fde68a;
    border-radius: 16px; padding: 20px 24px;
  }
  .disclaimer-alert h5 { font-size: 0.95rem; font-weight: 700; color: #92400e; margin: 0 0 8px; }
  .disclaimer-alert p  { font-size: 0.85rem; color: #78350f; margin: 0; line-height: 1.6; }

  /* collapsible section headers on mobile */
  .section-toggle {
    display: none; background: none; border: none; cursor: pointer;
    color: #6b7280; padding: 0; margin-left: auto;
  }

  /* layout */
  .main-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .main-grid { grid-template-columns: 280px 1fr; }
  }

  @media (max-width: 768px) {
    .medi-root { padding: 16px 12px; }
    .main-grid  { grid-template-columns: 1fr; }
    .sidebar    { border-radius: 16px; padding: 22px 18px; }
    .sidebar-features { display: none; }          /* hide feature cards on mobile */
    .sidebar-brand { margin-bottom: 16px; }
    .disclaimer-box { margin-top: 16px; }
    .form-card { padding: 20px 16px; border-radius: 16px; }
    .res-card-body { padding: 18px 16px; }
    .doctors-grid { grid-template-columns: 1fr; }
    .form-header { flex-wrap: wrap; gap: 8px; }
    .section-toggle { display: flex; }
  }

  @media (max-width: 480px) {
    .form-row { flex-direction: column; }
    .specialist-pill { flex-direction: column; align-items: flex-start; gap: 4px; }
  }

  /* loading pulse */
  .pulse-dot {
    display: inline-block; width: 8px; height: 8px;
    background: currentColor; border-radius: 50; margin-right: 6px;
    animation: pulse 1.2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;

/* ─── helpers ─── */
const urgencyClass = (u) =>
  u === "High" ? "urgency-high" : u === "Moderate" ? "urgency-moderate" : "urgency-low";

/* collapsible wrapper for response sections on mobile */
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="res-card">
      <div className="res-card-body">
        <div style={{ display: "flex", alignItems: "center", marginBottom: open ? 16 : 0 }}>
          <h4 style={{ margin: 0 }}>{title}</h4>
          <button className="section-toggle" onClick={() => setOpen(!open)} aria-label="toggle">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        {open && children}
      </div>
    </div>
  );
};

/* ─── main component ─── */
const AIHealthAssistant = () => {
  const [formData, setFormData] = useState({ symptoms: "", age: "", gender: "Male", duration: "" });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [doctors, setDoctors] = useState([]);
    const navigate=useNavigate();
  const backendUrl = "http://localhost:4000";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.symptoms.trim()) return toast.error("Please enter symptoms");
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/ai-health-assistant", formData);
      if (data.success) { setAiResponse(data.aiResponse); setDoctors(data.doctors || []); }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="medi-root">
        <div className="main-grid">

          {/* ── SIDEBAR ── */}
          <aside>
            <div className="sidebar">
              <div className="sidebar-brand">
                <div className="sidebar-icon-wrap"><Brain size={30} /></div>
                <div>
                  <h2>MediAssist AI</h2>
                  <p>Smart Healthcare Assistant</p>
                </div>
              </div>

              <div className="sidebar-features">
                {[
                  { icon: <Stethoscope size={20} />, title: "Symptom Analysis", desc: "AI-generated analysis based on symptoms and health details." },
                  { icon: <UserRound size={20} />, title: "Doctor Recommendation", desc: "Suggests specialists and doctors from your platform." },
                  { icon: <ShieldAlert size={20} />, title: "Emergency Detection", desc: "Detects dangerous symptoms requiring urgent attention." },
                ].map((f) => (
                  <div className="feature-card" key={f.title}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
                    <div><h6>{f.title}</h6><p>{f.desc}</p></div>
                  </div>
                ))}
              </div>

              <div className="disclaimer-box">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>AI-generated suggestions are informational only and should not replace professional medical advice.</span>
              </div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN ── */}
          <main>

            {/* INPUT CARD */}
            <div className="form-card">
              <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h2>AI Symptom Checker</h2>
                  <p className="sub">Describe your symptoms and get AI-powered guidance.</p>
                </div>
                <span className="ai-badge">✦ AI Generated</span>
              </div>

              <div className="form-row">
                <input type="number" name="age" value={formData.age} onChange={handleChange}
                  placeholder="Age" className="medi-input" />
                <select name="gender" value={formData.gender} onChange={handleChange} className="medi-select">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>

              <input type="text" name="duration" value={formData.duration} onChange={handleChange}
                placeholder="Duration  (e.g. 3 days)" className="medi-input" style={{ marginBottom: 14 }} />

              <textarea name="symptoms" rows={5} value={formData.symptoms} onChange={handleChange}
                placeholder="Describe your symptoms in detail…" className="medi-textarea" />

              <button className="analyze-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? (<><span className="pulse-dot" />Analyzing Symptoms…</>) : (<><Activity size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Analyze Symptoms</>)}
              </button>
            </div>

            {/* ── RESPONSE ── */}
            {aiResponse && (
              <div className="response-grid">

                {/* Analysis summary */}
                <div className="res-card">
                  <div className="res-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                      <h3 style={{ margin: 0 }}>AI Analysis</h3>
                      <span className={`urgency-badge ${urgencyClass(aiResponse.urgency)}`}>
                        {aiResponse.urgency} Urgency
                      </span>
                    </div>
                    <p className="summary-text">{aiResponse.summary}</p>
                    <div className="specialist-pill">
                      <Stethoscope size={22} style={{ flexShrink: 0 }} />
                      <div>
                        <div className="label">Recommended Specialist</div>
                        <div className="value">{aiResponse.recommended_specialist}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Possible conditions */}
                <Section title="Possible Conditions">
                  <div className="conditions-wrap">
                    {aiResponse.possible_conditions?.map((c, i) => (
                      <span className="condition-tag" key={i}>{c}</span>
                    ))}
                  </div>
                </Section>

                {/* Precautions */}
                <Section title="Recommended Precautions">
                  <ul className="medi-list">
                    {aiResponse.precautions?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </Section>

                {/* Emergency signs */}
                <div className="res-card emergency-card">
                  <div className="res-card-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <AlertTriangle size={20} color="#dc2626" />
                      <h4 style={{ margin: 0, color: "#dc2626" }}>Emergency Warning Signs</h4>
                    </div>
                    <ul className="medi-list emergency-list">
                      {aiResponse.emergency_signs?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Doctors */}
                <div className="res-card">
                  <div className="res-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                      <h3 style={{ margin: 0 }}>Suggested Doctors</h3>
                      <span style={{ fontSize: "0.83rem", color: "#6b7280" }}>{doctors.length} found</span>
                    </div>
                    {doctors.length === 0
                      ? <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No doctors found for this speciality.</p>
                      : (
                        <div className="doctors-grid">
                          {doctors.map((doc) => (
                            <div className="doctor-card" key={doc._id}>
                              <div className="doctor-top">
                                <img src={doc.image} alt={doc.name} />
                                <div>
                                  <h5>{doc.name}</h5>
                                  <p>{doc.speciality}</p>
                                </div>
                              </div>
                              <div className="doctor-meta">
                                <p><Clock size={13} /><strong>Experience:</strong>&nbsp;{doc.experience}</p>
                                <p><strong>Fees:</strong>&nbsp;₹{doc.fees}</p>
                                {doc.address?.line1 && <p><strong>Address:</strong>&nbsp;{doc.address.line1}</p>}
                              </div>
                              <button className="book-btn" onClick={()=>navigate(`/appointments/${doc._id}`)}>Book Appointment</button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="disclaimer-alert">
                  <h5>Medical Disclaimer</h5>
                  <p>{aiResponse.disclaimer}</p>
                </div>

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AIHealthAssistant;
