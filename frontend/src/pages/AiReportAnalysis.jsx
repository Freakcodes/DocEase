import React, { useContext, useRef, useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";



const AiReportAnalysis = () => {
  const { token, backEndUrl } = useContext(AppContext);

  const chatBottomRef = useRef(null);
  const navigate=useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [reportSummary, setReportSummary] = useState(null); // fix: was missing
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");

  // fix: auto-scroll whenever messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    const validatedFiles = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) { alert(`${file.name} is not supported`); continue; }
      if (file.size > 10 * 1024 * 1024) { alert(`${file.name} exceeds 10MB`); continue; }
      validatedFiles.push(file);
    }
    setSelectedFiles(validatedFiles);
    setResponse(null);
    setReportSummary(null);
    setMessages([]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return alert("Please select reports");
    try {
      setLoading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("reports", file));
      const { data } = await axios.post(
        `${backEndUrl}/api/user/ai-report-analysis`,
        formData,
        { headers: { usertoken: token } },
      );
      if (data.success) {
        setResponse(data.data);
        setReportSummary(data.data);   // fix: store for chat use
        setReportId(data.reportId);
        setMessages([{
          role: "assistant",
          content: "Your medical report has been analyzed. Ask me anything about your results.",
        }]);
        setActiveTab("summary");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // fix: accept optional override so quick prompts can pass value directly
  const handleSendMessage = async (overrideQuestion) => {
    const q = (overrideQuestion ?? question).trim();
    if (!q) return;

    const userMessage = { role: "user", content: q };
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    setQuestion("");
    setChatLoading(true);

    try {
      const { data } = await axios.post(
        `${backEndUrl}/api/user/chat`,
        {
          reportId,
          question: q,
          chatHistory: messages,   // history before this message
          // fix: only send reportSummary on the very first real user message
          reportSummary: messages.filter((m) => m.role === "user").length === 0
            ? reportSummary
            : undefined,
        },
        { headers: { usertoken: token } },
      );

      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to send message");
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSendMessage(); }
  };

  const statusColor = (status) => {
    if (!status) return { bg: "#f1f5f9", text: "#475569" };
    const s = status.toLowerCase();
    if (s === "critical") return { bg: "#fef2f2", text: "#b91c1c" };
    if (s === "high" || s === "low") return { bg: "#fff7ed", text: "#c2410c" };
    return { bg: "#fef9c3", text: "#854d0e" };
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font */}
      <style>{`
        
        * { box-sizing: border-box; }
        .chat-msg-md p { margin: 0 0 8px 0; }
        .chat-msg-md p:last-child { margin-bottom: 0; }
        .chat-msg-md strong { font-weight: 600; }
        .chat-msg-md ul, .chat-msg-md ol { margin: 6px 0 6px 18px; padding: 0; }
        .chat-msg-md li { margin-bottom: 4px; }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 14px; font-size: 13px; font-family: inherit; font-weight: 500; color: #94a3b8; border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; white-space: nowrap; }
        .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
        .tab-btn:hover:not(.active) { color: #475569; }
        .file-chip { display:flex; align-items:center; gap:10px; padding:10px 14px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; }
        .remove-btn { width:24px; height:24px; border-radius:50%; background:#fee2e2; color:#dc2626; border:none; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .quick-chip { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:20px; padding:6px 14px; font-size:12px; font-family:inherit; cursor:pointer; transition:background .15s; white-space:nowrap; }
        .quick-chip:hover { background:#dbeafe; }
        .send-btn { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#2563eb,#4f46e5); color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:opacity .15s; }
        .send-btn:disabled { opacity:.5; cursor:not-allowed; }
        .analyze-btn { width:100%; padding:14px; background:linear-gradient(135deg,#2563eb,#4f46e5); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:600; font-family:inherit; cursor:pointer; transition:opacity .15s; }
        .analyze-btn:disabled { opacity:.6; cursor:not-allowed; }
        .typing-dot { width:7px; height:7px; border-radius:50%; background:#94a3b8; animation: blink 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay:.2s; }
        .typing-dot:nth-child(3) { animation-delay:.4s; }
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* ── TOP NAV ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2563eb,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 17 }}>🩺</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>AI Medical Report Analysis</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Upload reports · Get insights · Ask questions</div>
        </div>
        {response && (
          <div style={{ marginLeft: "auto", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
            ✓ {response.report_type}
          </div>
        )}
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 58px)" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width: response ? "40%" : "100%", minWidth: response ? 320 : undefined, transition: "width .3s ease", background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {!response ? (
            /* UPLOAD STATE */
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <label htmlFor="fileUpload" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #bfdbfe", borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: "#f8faff", minHeight: 190, transition: "border-color .2s" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#ede9fe,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 12 }}>📤</div>
                <p style={{ fontWeight: 600, color: "#1e40af", margin: "0 0 4px", fontSize: 14 }}>Drop files here or click to browse</p>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: 12 }}>PDF, JPG, JPEG, PNG · Max 10MB each</p>
                <input id="fileUpload" type="file" hidden multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
              </label>

              {selectedFiles.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected</div>
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="file-chip">
                      <span style={{ fontSize: 20 }}>📄</span>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                      <button className="remove-btn" onClick={() => handleRemoveFile(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button className="analyze-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", marginRight: 8, verticalAlign: "middle" }}></span>Analyzing...</> : "✨ Analyze Report"}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["🔒", "Private & Secure"], ["⚡", "AI-Powered"], ["💬", "Ask Questions"]].map(([icon, label]) => (
                  <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: "#f8faff", borderRadius: 10 }}>
                    <div style={{ fontSize: 18 }}>{icon}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* RESULTS STATE */
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* re-upload strip */}
              <div style={{ padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
                <label htmlFor="fileUpload2" style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>
                  + New Report
                </label>
                <input id="fileUpload2" type="file" hidden multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                <span style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedFiles.map((f) => f.name).join(", ")}
                </span>
              </div>

              {/* tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fff", overflowX: "auto", flexShrink: 0 }}>
                {["summary", "abnormalities", "precautions"].map((tab) => (
                  <button key={tab} className={`tab-btn${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === "abnormalities" && response?.abnormalities?.length > 0 && (
                      <span style={{ marginLeft: 6, background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>
                        {response.abnormalities.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* tab content */}
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

                {activeTab === "summary" && (
                  <>
                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Summary</div>
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: "#0c4a6e", margin: 0 }}>{response?.summary}</p>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                      <span style={{ background: "#1e293b", color: "#f8fafc", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 }}>
                        🩺 {response?.recommended_specialist}
                      </span>
                      {response?.doctor_consultation_needed && (
                        <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 }}>
                          ⚠ Consultation Recommended
                        </span>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "abnormalities" && (
                  response?.abnormalities?.length === 0
                    ? <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>No abnormalities detected ✅</div>
                    : response?.abnormalities?.map((abn, i) => {
                        const c = statusColor(abn.status);
                        return (
                          <div key={i} style={{ border: "1px solid #fecaca", borderRadius: 12, padding: 14, background: "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{abn.test}</span>
                              <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{abn.status}</span>
                            </div>
                            <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 6 }}>
                              <span style={{ color: "#64748b" }}>Value: <strong style={{ color: "#dc2626" }}>{abn.value}</strong></span>
                              <span style={{ color: "#94a3b8" }}>Ref: {abn.reference_range}</span>
                            </div>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{abn.reason}</p>
                          </div>
                        );
                      })
                )}

                {activeTab === "precautions" && (
                  response?.precautions?.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 12 }}>
                      <span style={{ color: "#16a34a", fontSize: 15, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: 13, color: "#14532d", margin: 0, lineHeight: 1.55 }}>{item}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — chat ── */}
        {response && (
  token ? (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        minWidth: 0,
      }}
    >

            {/* chat header */}
            <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🤖</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>AI Medical Assistant</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Ask questions about your report</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#16a34a" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }}></span>
                Online
              </div>
            </div>

            {/* messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    background: msg.role === "user" ? "linear-gradient(135deg,#2563eb,#4f46e5)" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1e293b",
                    border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}>
                    {/* fix: render markdown instead of raw text */}
                    {msg.role === "assistant"
                      ? <div className="chat-msg-md"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                      : msg.content
                    }
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              {chatLoading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* quick prompts — fix: pass q directly, no setTimeout race */}
            {messages.filter((m) => m.role === "user").length === 0 && (
              <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 7 }}>
                {["What are the key findings?", "What should I do next?", "Explain the abnormalities", "Is this serious?"].map((q) => (
                  <button key={q} className="quick-chip" onClick={() => handleSendMessage(q)}>{q}</button>
                ))}
              </div>
            )}

            {/* input */}
            <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Ask about your report..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, padding: "10px 18px", borderRadius: 24, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8fafc", color: "#0f172a" }}
                />
                <button className="send-btn" onClick={() => handleSendMessage()} disabled={chatLoading || !question.trim()}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", margin: "8px 0 0" }}>
                AI responses are informational only — not a substitute for professional medical advice.
              </p>
            </div>
                   </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            padding: "30px",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "40px 30px",
              textAlign: "center",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: "30px",
              }}
            >
              🔐
            </div>

            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "10px",
              }}
            >
              Login Required
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.7",
                marginBottom: "24px",
              }}
            >
              Please login to chat with your AI medical assistant
              and ask questions about your uploaded report.
            </p>

            <button
              onClick={() => navigate("/login")}
              style={{
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 22px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Login to Continue
            </button>
          </div>
        </div>
      )
)}
      </div>
    </div>
  );
};

export default AiReportAnalysis;
