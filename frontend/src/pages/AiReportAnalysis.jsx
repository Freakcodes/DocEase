import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";

// ── Helpers ───────────────────────────────────────────────────────────────────
const abnormalityBadgeCls = (status) => {
  if (!status) return "bg-secondary-subtle text-secondary";
  const s = status.toLowerCase();
  if (s === "critical") return "bg-danger-subtle text-danger";
  if (s === "high" || s === "low")
    return "bg-warning-subtle text-warning-emphasis";
  return "bg-secondary-subtle text-secondary";
};

// ── AiReportAnalysis ──────────────────────────────────────────────────────────
// Handles three modes:
//   1. /ai-report          → fresh upload + analyze + live chat
//   2. /ai-report/:id      → reopen stored report → read-only analysis + fresh chat
//   3. /report-history     → list of all past reports (navigate to /ai-report/:id)
// All three live in this one file as separate view components, routed via `mode` prop.

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: HISTORY LIST
// ─────────────────────────────────────────────────────────────────────────────
const HistoryView = ({ backEndUrl, token, navigate }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(backEndUrl + "/api/user/reports", { headers: { usertoken: token } })
      .then(({ data }) => {
        if (data.success) setReports(data.reports);
        console.log(data.reports);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column gap-3 mt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex gap-3">
              <div
                className="rounded-3 bg-secondary bg-opacity-10 flex-shrink-0"
                style={{ width: 48, height: 48 }}
              />
              <div className="flex-grow-1">
                <div
                  className="bg-secondary bg-opacity-10 rounded mb-2"
                  style={{ height: 13, width: "40%" }}
                />
                <div
                  className="bg-secondary bg-opacity-10 rounded mb-2"
                  style={{ height: 11, width: "80%" }}
                />
                <div
                  className="bg-secondary bg-opacity-10 rounded"
                  style={{ height: 11, width: "55%" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 text-center py-5 mt-2">
        <div
          className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 72, height: 72 }}
        >
          <i
            className="bi bi-file-earmark-medical text-primary"
            style={{ fontSize: "2rem" }}
          />
        </div>
        <h6 className="fw-bold mb-1">No reports yet</h6>
        <p className="text-muted small mb-4">
          Upload a medical report to get AI-powered analysis
        </p>
        <button
          className="btn btn-primary rounded-3 px-4 fw-semibold mx-auto"
          onClick={() => navigate("/ai-report")}
        >
          <i className="bi bi-upload me-2" />
          Upload a Report
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 mt-2">
      {reports.map((report) => (
        <div
          key={report._id}
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/ai-report/${report._id}`)}
        >
          <div className="bg-primary" style={{ height: "3px" }} />
          <div className="card-body p-4">
            <div className="d-flex align-items-start gap-3">
              <div
                className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 48, height: 48 }}
              >
                <i className="bi bi-file-earmark-text text-primary fs-5" />
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h6 className="fw-bold mb-0">
                    {report.reportType || "Medical Report"}
                  </h6>
                  {report.aiAnalysis?.doctor_consultation_needed && (
                    <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-1 small">
                      <i className="bi bi-exclamation-circle me-1" />
                      Consultation Needed
                    </span>
                  )}
                </div>
                <p className="text-muted small mb-2 text-truncate">
                  {report.aiAnalysis?.summary
                    ? report.aiAnalysis.summary.slice(0, 120) + "..."
                    : "No summary available"}
                </p>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <span className="text-muted small">
                    <i className="bi bi-calendar3 me-1 text-primary" />
                    {new Date(report.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {report.aiAnalysis?.recommended_specialist && (
                    <span className="text-muted small">
                      <i className="bi bi-person-badge me-1 text-primary" />
                      {report.aiAnalysis.recommended_specialist}
                    </span>
                  )}
                  {report.aiAnalysis?.abnormalities?.length > 0 && (
                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 small">
                      <i className="bi bi-exclamation-triangle me-1" />
                      {report.aiAnalysis.abnormalities.length} abnormalit
                      {report.aiAnalysis.abnormalities.length > 1 ? "ies" : "y"}
                    </span>
                  )}
                </div>
              </div>
              <i className="bi bi-chevron-right text-muted flex-shrink-0 mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: ANALYSIS PANEL (tabs: summary / abnormalities / precautions)
// ─────────────────────────────────────────────────────────────────────────────
const AnalysisPanel = ({ ai }) => {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="bg-primary" style={{ height: "4px" }} />

      {/* Tabs */}
      <div className="d-flex border-bottom bg-white overflow-x-auto flex-shrink-0">
        {[
          { key: "summary", label: "Summary", icon: "bi-file-text" },
          {
            key: "abnormalities",
            label: "Abnormalities",
            icon: "bi-exclamation-circle",
            count: ai?.abnormalities?.length,
          },
          { key: "precautions", label: "Precautions", icon: "bi-shield-check" },
        ].map(({ key, label, icon, count }) => (
          <button
            key={key}
            className="btn btn-link text-decoration-none px-4 py-3 rounded-0 border-0 fw-semibold small d-flex align-items-center gap-2 flex-shrink-0"
            style={{
              color: activeTab === key ? "#0d6efd" : "#6c757d",
              borderBottom:
                activeTab === key
                  ? "2px solid #0d6efd"
                  : "2px solid transparent",
            }}
            onClick={() => setActiveTab(key)}
          >
            <i className={`bi ${icon}`} />
            {label}
            {count > 0 && (
              <span
                className="badge bg-danger rounded-pill px-2"
                style={{ fontSize: "10px" }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card-body p-4">
        {/* Summary */}
        {activeTab === "summary" && (
          <div
            className="rounded-3 p-4"
            style={{ background: "#f0f9ff", borderLeft: "4px solid #0ea5e9" }}
          >
            <p
              className="small fw-bold text-uppercase text-muted mb-2"
              style={{ letterSpacing: "0.5px" }}
            >
              Analysis Summary
            </p>
            <p className="mb-0 text-dark" style={{ lineHeight: 1.75 }}>
              {ai?.summary || "No summary available."}
            </p>
          </div>
        )}

        {/* Abnormalities */}
        {activeTab === "abnormalities" &&
          (ai?.abnormalities?.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "3rem" }}
              />
              <p className="fw-bold mt-3 mb-1">All Clear</p>
              <p className="text-muted small">
                No abnormalities detected in this report.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {ai?.abnormalities?.map((abn, i) => (
                <div key={i} className="border rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold">{abn.test}</span>
                    <span
                      className={`badge rounded-pill px-3 ${abnormalityBadgeCls(abn.status)}`}
                    >
                      {abn.status}
                    </span>
                  </div>
                  <div className="d-flex gap-3 small mb-2">
                    <span className="text-muted">
                      Value:{" "}
                      <strong className="text-danger">{abn.value}</strong>
                    </span>
                    <span className="text-muted">
                      Ref: {abn.reference_range}
                    </span>
                  </div>
                  <p className="text-muted small mb-0">{abn.reason}</p>
                </div>
              ))}
            </div>
          ))}

        {/* Precautions */}
        {activeTab === "precautions" && (
          <div className="d-flex flex-column gap-2">
            {ai?.precautions?.length === 0 ? (
              <p className="text-muted small text-center py-4">
                No precautions listed.
              </p>
            ) : (
              ai?.precautions?.map((item, i) => (
                <div
                  key={i}
                  className="d-flex align-items-start gap-3 rounded-3 p-3"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-1" />
                  <p
                    className="mb-0 small text-dark"
                    style={{ lineHeight: 1.65 }}
                  >
                    {item}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VIEW: CHAT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const ChatPanel = ({
  backEndUrl,
  token,
  reportId,
  reportSummary,
  navigate,
}) => {
  const chatBottomRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Your report has been analysed. Ask me anything about your results.",
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const sendMessage = async (overrideQ) => {
    if (!token) {
      navigate("/login");
      return;
    }
    const q = (overrideQ ?? question).trim();
    if (!q) return;

    const userMsg = { role: "user", content: q };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setQuestion("");
    setChatLoading(true);

    try {
      const { data } = await axios.post(
        `${backEndUrl}/api/user/chat`,
        {
          reportId,
          question: q,
          chatHistory: messages,
          reportSummary:
            messages.filter((m) => m.role === "user").length === 0
              ? reportSummary
              : undefined,
        },
        { headers: { usertoken: token } },
      );
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickPrompts = [
    "What are the key findings?",
    "What should I do next?",
    "Explain the abnormalities",
    "Is this serious?",
  ];

  return (
    <div
      className="card border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column"
      style={{ height: "520px" }}
    >
      <div className="bg-primary" style={{ height: "4px" }} />

      {/* Header */}
      <div className="d-flex align-items-center gap-3 px-4 py-3 border-bottom bg-white flex-shrink-0">
        <div
          className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 38, height: 38 }}
        >
          <i className="bi bi-robot text-primary" />
        </div>
        <div>
          <p className="fw-bold small mb-0">AI Medical Assistant</p>
          <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
            Ask questions about your report
          </p>
        </div>
        <div className="ms-auto d-flex align-items-center gap-2">
          <span
            className="rounded-circle bg-success d-inline-block"
            style={{ width: 7, height: 7 }}
          />
          <span className="text-success small fw-semibold">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-y-auto p-3 d-flex flex-column gap-3"
        style={{ background: "#f8fafc" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`d-flex align-items-end gap-2 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 28, height: 28 }}
              >
                <i className="bi bi-robot text-primary small" />
              </div>
            )}
            <div
              className="px-3 py-2 small"
              style={{
                maxWidth: "75%",
                borderRadius:
                  msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                background: msg.role === "user" ? "#0d6efd" : "#fff",
                color: msg.role === "user" ? "#fff" : "#1e293b",
                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                lineHeight: 1.6,
              }}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="d-flex align-items-end gap-2">
            <div
              className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 28, height: 28 }}
            >
              <i className="bi bi-robot text-primary small" />
            </div>
            <div className="bg-white border rounded-pill px-3 py-2 d-flex gap-2 align-items-center">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="rounded-circle bg-secondary d-inline-block"
                  style={{
                    width: 6,
                    height: 6,
                    opacity: 0.4,
                    animation: `pulse 1.2s ${d * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.filter((m) => m.role === "user").length === 0 && (
        <div className="px-3 py-2 border-top bg-white d-flex flex-wrap gap-2 flex-shrink-0">
          {quickPrompts.map((q) => (
            <button
              key={q}
              className="btn btn-sm rounded-pill border px-3 py-1 small"
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                borderColor: "#bfdbfe",
              }}
              onClick={() => sendMessage(q)}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-top bg-white flex-shrink-0">
        {!token ? (
          <button
            className="btn btn-primary w-100 rounded-3 fw-semibold"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-lock me-2" />
            Login to chat
          </button>
        ) : (
          <div className="d-flex gap-2 align-items-center">
            <input
              type="text"
              className="form-control rounded-pill border"
              placeholder="Ask about your report..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ background: "#f8fafc" }}
            />
            <button
              className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 42, height: 42 }}
              onClick={() => sendMessage()}
              disabled={chatLoading || !question.trim()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        )}
        <p
          className="text-muted text-center mb-0 mt-2"
          style={{ fontSize: "11px" }}
        >
          AI responses are informational only — not a substitute for
          professional medical advice.
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        .overflow-y-auto { overflow-y: auto; }
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AiReportAnalysis = ({ mode = "upload" }) => {
  // mode = "upload" | "history" | "view"
  const { token, backEndUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const { id: reportIdParam } = useParams();

  // Upload + analysis state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);

  // For view mode — loading stored report
  const [storedReport, setStoredReport] = useState(null);
  const [storedLoading, setStoredLoading] = useState(false);

  // Active section tab ("upload" | "history" | "view")
  const [activeSection, setActiveSection] = useState(mode);

  useEffect(() => {
    setActiveSection(mode);
  }, [mode]);

  // Load stored report when in view mode
  useEffect(() => {
    if (mode === "view" && reportIdParam && token) {
      setStoredLoading(true);
      axios
        .get(`${backEndUrl}/api/user/report/${reportIdParam}`, {
          headers: { usertoken: token },
        })
        .then(({ data }) => {
          if (data.success) {
            setStoredReport(data.report);
            setReportId(data.report._id);
            setAnalysisResult(data.report.aiAnalysis);
          }
        })
        .catch(() => {})
        .finally(() => setStoredLoading(false));
    }
  }, [mode, reportIdParam, token]);

  // File handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    const valid = files.filter((f) => {
      if (!allowed.includes(f.type)) {
        alert(`${f.name} is not supported`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert(`${f.name} exceeds 10MB`);
        return false;
      }
      return true;
    });
    setSelectedFiles(valid);
    setAnalysisResult(null);
  };

  const removeFile = (i) =>
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return alert("Please select a report file");
    try {
      setLoading(true);
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("reports", f));
      const { data } = await axios.post(
        `${backEndUrl}/api/user/ai-report-analysis`,
        formData,
        { headers: { usertoken: token } },
      );
      if (data.success) {
        setAnalysisResult(data.data);
        setReportId(data.reportId);
      }
    } catch (err) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFiles([]);
    setAnalysisResult(null);
    setReportId(null);
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "960px" }}>
        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start mb-4 gap-3">
          <div>
            <p className="text-primary fw-semibold small text-uppercase mb-1">
              <i className="bi bi-robot me-1" />
              AI Analysis
            </p>
            <h4 className="fw-bold mb-0">Medical Report Analysis</h4>
            <p className="text-muted small mt-1">
              Upload reports, get insights, ask questions
            </p>
          </div>
        </div>

        {/* ── Section Tabs ──────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="d-flex border-bottom bg-white">
            {[
              { key: "upload", label: "New Analysis", icon: "bi-upload" },
              {
                key: "history",
                label: "Past Reports",
                icon: "bi-clock-history",
              },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                className="btn btn-link text-decoration-none px-4 py-3 rounded-0 border-0 fw-semibold small d-flex align-items-center gap-2"
                style={{
                  color:
                    activeSection === key ||
                    (activeSection === "view" && key === "history")
                      ? "#0d6efd"
                      : "#6c757d",
                  borderBottom:
                    activeSection === key ||
                    (activeSection === "view" && key === "history")
                      ? "2px solid #0d6efd"
                      : "2px solid transparent",
                }}
                onClick={() => {
                  if (key === "upload") {
                    navigate("/ai-report");
                    setActiveSection("upload");
                    resetUpload();
                  }
                  if (key === "history") {
                    navigate("/report-history");
                    setActiveSection("history");
                  }
                }}
              >
                <i className={`bi ${icon}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION: HISTORY ──────────────────────────────────── */}
        {activeSection === "history" && (
          <HistoryView
            backEndUrl={backEndUrl}
            token={token}
            navigate={navigate}
          />
        )}

        {/* ── SECTION: VIEW STORED REPORT ───────────────────────── */}
        {activeSection === "view" &&
          (storedLoading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3">Loading report...</p>
            </div>
          ) : storedReport ? (
            <div>
              {/* Back + meta */}
              <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                <button
                  className="btn btn-link text-muted p-0 text-decoration-none small"
                  onClick={() => navigate("/report-history")}
                >
                  <i className="bi bi-arrow-left me-1" />
                  Back to history
                </button>
                <span className="text-muted small ms-auto">
                  <i className="bi bi-calendar3 me-1" />
                  {new Date(storedReport.createdAt).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" },
                  )}
                </span>
                {storedReport.reportType && (
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                    {storedReport.reportType}
                  </span>
                )}
                {storedReport.aiAnalysis?.doctor_consultation_needed && (
                  <span className="badge bg-danger-subtle text-danger rounded-pill px-3">
                    <i className="bi bi-exclamation-circle me-1" />
                    Consultation Needed
                  </span>
                )}
              </div>

              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <AnalysisPanel ai={storedReport.aiAnalysis} />
                </div>
                <div className="col-12 col-lg-6">
                  <ChatPanel
                    backEndUrl={backEndUrl}
                    token={token}
                    reportId={reportId}
                    reportSummary={storedReport.aiAnalysis}
                    navigate={navigate}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i
                className="bi bi-file-earmark-x text-muted"
                style={{ fontSize: "3rem" }}
              />
              <p className="text-muted mt-3 fw-medium">Report not found</p>
              <button
                className="btn btn-outline-primary rounded-3"
                onClick={() => navigate("/report-history")}
              >
                Back to History
              </button>
            </div>
          ))}

        {/* ── SECTION: UPLOAD / NEW ANALYSIS ────────────────────── */}
        {activeSection === "upload" &&
          (!analysisResult ? (
            /* Upload UI */
            <div className="row justify-content-center">
              <div className="col-12 col-md-8">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="bg-primary" style={{ height: "4px" }} />
                  <div className="card-body p-4">
                    <h6
                      className="fw-bold text-uppercase text-muted small mb-3"
                      style={{ letterSpacing: "1px" }}
                    >
                      <i className="bi bi-cloud-arrow-up me-2 text-primary" />
                      Upload Report
                    </h6>

                    {/* Drop zone */}
                    <label
                      htmlFor="aiReportUpload"
                      className="d-flex flex-column align-items-center justify-content-center rounded-4 mb-3"
                      style={{
                        border: "2px dashed #bfdbfe",
                        background: "#f8faff",
                        minHeight: 180,
                        cursor: "pointer",
                        padding: "32px 24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mb-3"
                        style={{ width: 60, height: 60 }}
                      >
                        <i
                          className="bi bi-file-earmark-arrow-up text-primary"
                          style={{ fontSize: "1.6rem" }}
                        />
                      </div>
                      <p className="fw-semibold text-primary mb-1 small">
                        Click to browse or drag & drop
                      </p>
                      <p className="text-muted mb-0 small">
                        PDF, JPG, JPEG, PNG · Max 10MB each
                      </p>
                      <input
                        id="aiReportUpload"
                        type="file"
                        hidden
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* Selected files */}
                    {selectedFiles.length > 0 && (
                      <div className="d-flex flex-column gap-2 mb-3">
                        {selectedFiles.map((file, i) => (
                          <div
                            key={i}
                            className="d-flex align-items-center gap-3 bg-light border rounded-3 p-3"
                          >
                            <div
                              className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 40, height: 40 }}
                            >
                              <i className="bi bi-file-earmark-text text-primary" />
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <p className="fw-semibold small mb-0 text-truncate">
                                {file.name}
                              </p>
                              <p className="text-muted small mb-0">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-3"
                              onClick={() => removeFile(i)}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      className="btn btn-primary w-100 fw-semibold rounded-3 py-2"
                      onClick={handleAnalyze}
                      disabled={loading || selectedFiles.length === 0}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Analysing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-stars me-2" />
                          Analyse Report
                        </>
                      )}
                    </button>

                    {/* Trust badges */}
                    <div className="row g-2 mt-3">
                      {[
                        { icon: "bi-lock", label: "Private & Secure" },
                        { icon: "bi-lightning", label: "AI-Powered" },
                        { icon: "bi-chat-dots", label: "Ask Questions" },
                      ].map(({ icon, label }) => (
                        <div key={label} className="col-4">
                          <div className="text-center p-2 bg-light rounded-3">
                            <i className={`bi ${icon} text-primary`} />
                            <p
                              className="text-muted mb-0 mt-1"
                              style={{ fontSize: "11px" }}
                            >
                              {label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis + Chat UI */
            <div>
              {/* Analysed file + reset */}
              <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success" />
                  <span className="fw-semibold small">
                    {selectedFiles.map((f) => f.name).join(", ")}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-3 ms-auto"
                  onClick={resetUpload}
                >
                  <i className="bi bi-arrow-left me-1" />
                  Analyse another report
                </button>
              </div>

              {/* Consultation alert */}
              {analysisResult?.doctor_consultation_needed && (
                <div
                  className="alert rounded-4 border-0 mb-4 d-flex align-items-center gap-3"
                  style={{
                    background: "#fef2f2",
                    borderLeft: "4px solid #dc2626",
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-5 flex-shrink-0" />
                  <div>
                    <p className="fw-bold mb-0 small text-danger">
                      Doctor Consultation Recommended
                    </p>
                    <p className="text-muted small mb-0">
                      This report contains findings that may require
                      professional medical attention.
                    </p>
                  </div>
                </div>
              )}

              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <AnalysisPanel ai={analysisResult} />
                </div>
                <div className="col-12 col-lg-6">
                  <ChatPanel
                    backEndUrl={backEndUrl}
                    token={token}
                    reportId={reportId}
                    reportSummary={analysisResult}
                    navigate={navigate}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AiReportAnalysis;
