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
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

/* ── Collapsible section (mobile-friendly) ───────────────────────────────── */
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div
        className="card-header bg-white border-0 d-flex align-items-center justify-content-between py-3 px-4"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </div>
        <span className="text-secondary">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>
      {open && <div className="card-body px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
};

/* ── Urgency badge helper ────────────────────────────────────────────────── */
const UrgencyBadge = ({ level }) => {
  const map = {
    High: "danger",
    Moderate: "warning",
    Low: "success",
  };
  const color = map[level] || "secondary";
  return (
    <span className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle rounded-pill px-3 py-2 fw-semibold`}
      style={{ fontSize: "0.78rem" }}>
      {level} Urgency
    </span>
  );
};

/* ── Main component ──────────────────────────────────────────────────────── */
const AIHealthAssistant = () => {
  const [formData, setFormData] = useState({
    symptoms: "",
    age: "",
    gender: "Male",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const {backEndUrl}=useContext(AppContext);
  const navigate = useNavigate();
  

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.symptoms.trim()) return toast.error("Please enter your symptoms");
    setLoading(true);
    try {
      const { data } = await axios.post(
        backEndUrl + "/api/user/ai-health-assistant",
        formData
      );
      if (data.success) {
        setAiResponse(data.aiResponse);
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 px-3" style={{ background: "#f0f4ff" }}>
      <div className="container-xl">
        <div className="row g-4">

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
         

          {/* ── MAIN COLUMN ──────────────────────────────────────────────── */}
          <div className="col-12 col-lg-9 mx-auto">

            {/* INPUT CARD */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
                  <div>
                    <h4 className="fw-bold mb-1">AI Symptom Checker</h4>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.88rem" }}>
                      Describe your symptoms and get AI-powered guidance.
                    </p>
                  </div>
                  <span
                    className="badge rounded-pill px-3 py-2 fw-semibold"
                    style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.75rem" }}
                  >
                    ✦ AI Generated
                  </span>
                </div>

                {/* Age + Gender */}
                <div className="row g-3 mb-3">
                  <div className="col-6 col-sm-4">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Age"
                      className="form-control rounded-3"
                      min={0}
                    />
                  </div>
                  <div className="col-6 col-sm-4">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-select rounded-3"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-4">
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="Duration (e.g. 3 days)"
                      className="form-control rounded-3"
                    />
                  </div>
                </div>

                {/* Symptoms */}
                <textarea
                  name="symptoms"
                  rows={5}
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe your symptoms in detail…"
                  className="form-control rounded-3 mb-4"
                  style={{ resize: "vertical" }}
                />

                <button
                  className="btn btn-primary w-100 rounded-3 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg,#2563eb,#4338ca)",
                    border: "none",
                    fontSize: "0.97rem",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Analyzing Symptoms…
                    </>
                  ) : (
                    <>
                      <Activity size={17} />
                      Analyze Symptoms
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── RESPONSE ─────────────────────────────────────────────── */}
            {aiResponse && (
              <div className="d-flex flex-column gap-4">

                {/* Analysis summary */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <h5 className="fw-bold mb-0">AI Analysis</h5>
                      <UrgencyBadge level={aiResponse.urgency} />
                    </div>
                    <p className="text-secondary mb-4" style={{ lineHeight: 1.7, fontSize: "0.93rem" }}>
                      {aiResponse.summary}
                    </p>
                    <div
                      className="rounded-3 p-3 d-flex align-items-center gap-3 text-white"
                      style={{ background: "linear-gradient(135deg,#2563eb,#4338ca)" }}
                    >
                      <Stethoscope size={22} className="flex-shrink-0" />
                      <div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>Recommended Specialist</div>
                        <div className="fw-semibold" style={{ fontSize: "1rem" }}>
                          {aiResponse.recommended_specialist}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Possible conditions */}
                <Section title="Possible Conditions" icon={<Brain size={18} />}>
                  <div className="d-flex flex-wrap gap-2 pt-1">
                    {aiResponse.possible_conditions?.map((c, i) => (
                      <span
                        key={i}
                        className="badge rounded-pill border border-primary-subtle bg-primary-subtle text-primary px-3 py-2"
                        style={{ fontSize: "0.82rem", fontWeight: 500 }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </Section>

                {/* Precautions */}
                <Section title="Recommended Precautions" icon={<ShieldAlert size={18} />}>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2 pt-1">
                    {aiResponse.precautions?.map((item, i) => (
                      <li
                        key={i}
                        className="d-flex gap-2 align-items-start py-2 border-bottom border-light"
                        style={{ fontSize: "0.9rem", color: "#374151" }}
                      >
                        <span className="text-primary fw-bold mt-1" style={{ flexShrink: 0 }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Emergency warning signs */}
                <div className="card border-danger-subtle shadow-sm rounded-4 overflow-hidden"
                  style={{ background: "#fff5f5" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <AlertTriangle size={20} className="text-danger flex-shrink-0" />
                      <h5 className="fw-bold mb-0 text-danger">Emergency Warning Signs</h5>
                    </div>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {aiResponse.emergency_signs?.map((item, i) => (
                        <li
                          key={i}
                          className="d-flex gap-2 align-items-start py-2 border-bottom"
                          style={{
                            fontSize: "0.9rem",
                            color: "#dc2626",
                            borderBottomColor: "#fee2e2 !important",
                          }}
                        >
                          <span className="fw-bold mt-1" style={{ flexShrink: 0 }}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested Doctors */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                      <h5 className="fw-bold mb-0">Suggested Doctors</h5>
                      <span className="text-secondary" style={{ fontSize: "0.83rem" }}>
                        {doctors.length} found
                      </span>
                    </div>

                    {doctors.length === 0 ? (
                      <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                        No doctors found for this speciality.
                      </p>
                    ) : (
                      <div className="row g-3">
                        {doctors.map((doc) => (
                          <div className="col-12 col-sm-6 col-xl-4" key={doc._id}>
                            <div className="card border rounded-3 h-100 p-3"
                              style={{ transition: "box-shadow 0.2s" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.12)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.boxShadow = "none")
                              }
                            >
                              <div className="d-flex gap-3 align-items-start mb-3">
                                <img
                                  src={doc.image}
                                  alt={doc.name}
                                  className="rounded-3 object-fit-cover flex-shrink-0"
                                  style={{ width: 60, height: 60 }}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://placehold.co/60x60?text=Dr";
                                  }}
                                />
                                <div className="overflow-hidden">
                                  <h6 className="fw-bold mb-0 text-truncate">{doc.name}</h6>
                                  <p className="text-primary mb-0 fw-semibold" style={{ fontSize: "0.82rem" }}>
                                    {doc.speciality}
                                  </p>
                                </div>
                              </div>

                              <div className="text-secondary mb-3 d-flex flex-column gap-1" style={{ fontSize: "0.82rem" }}>
                                <span className="d-flex align-items-center gap-1">
                                  <Clock size={13} />
                                  <strong className="text-dark">Experience:</strong>&nbsp;{doc.experience}
                                </span>
                                <span>
                                  <strong className="text-dark">Fees:</strong>&nbsp;₹{doc.fees}
                                </span>
                                {doc.address?.line1 && (
                                  <span>
                                    <strong className="text-dark">Address:</strong>&nbsp;{doc.address.line1}
                                  </span>
                                )}
                              </div>

                              <button
                                className="btn btn-outline-primary rounded-3 w-100 fw-semibold mt-auto"
                                style={{ fontSize: "0.87rem" }}
                                onClick={() => navigate(`/appointments/${doc._id}`)}
                              >
                                Book Appointment
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Disclaimer */}
                <div
                  className="rounded-4 p-4"
                  style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}
                >
                  <h6 className="fw-bold mb-2" style={{ color: "#92400e" }}>
                    ⚠ Medical Disclaimer
                  </h6>
                  <p className="mb-0" style={{ fontSize: "0.85rem", color: "#78350f", lineHeight: 1.6 }}>
                    {aiResponse.disclaimer}
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHealthAssistant;
