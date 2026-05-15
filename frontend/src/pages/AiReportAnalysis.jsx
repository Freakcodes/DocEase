import React, { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const AiReportAnalysis = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const { backEndUrl } = useContext(AppContext);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    const validatedFiles = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a supported file type`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB limit`);
        continue;
      }

      validatedFiles.push(file);
    }

    setSelectedFiles(validatedFiles);
    setResponse(null);
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove,
    );

    setSelectedFiles(updatedFiles);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("reports", file);
      });

      const aiRes = await axios.post(
        `${backEndUrl}/api/user/ai-report-analysis`,
        formData,
      );

      setResponse(aiRes.data.data);
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background:
          "linear-gradient(to right, rgb(240,244,255), rgb(248,250,255))",
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fw-bold display-6 text-primary">
            AI Medical Report Analysis
          </h1>

          <p className="text-muted mt-3">
            Upload medical reports and get AI-powered insights instantly.
          </p>
        </div>

        {/* Upload Card */}
        <div
          className="card border-0 shadow-lg p-4 mx-auto"
          style={{
            maxWidth: "900px",
            borderRadius: "24px",
          }}
        >
          {/* Upload Box */}
          <label
            htmlFor="fileUpload"
            className="border border-2 border-primary border-opacity-25 rounded-4 p-5 text-center cursor-pointer"
            style={{
              backgroundColor: "#f8fbff",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <div className="mb-3">
              <div
                className="mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#e7f1ff",
                  fontSize: "2rem",
                }}
              >
                📄
              </div>
            </div>

            <h4 className="fw-bold text-primary">Upload Medical Reports</h4>

            <p className="text-muted mb-0">
              Drag & drop files or click to browse
            </p>

            <small className="text-secondary">
              Supports PDF, JPG, JPEG, PNG
            </small>

            <input
              id="fileUpload"
              type="file"
              multiple
              hidden
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </label>

          {/* Preview Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Selected Files</h5>

                <span className="badge bg-primary">
                  {selectedFiles.length} Files
                </span>
              </div>

              <div className="row g-3">
                {selectedFiles.map((file, index) => {
                  const isImage = file.type.startsWith("image/");

                  return (
                    <div className="col-md-4 col-lg-3" key={index}>
                      <div
                        className="card border-0 shadow-sm h-100 overflow-hidden"
                        style={{
                          borderRadius: "18px",
                        }}
                      >
                        {/* Image Preview */}
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              height: "180px",
                              objectFit: "cover",
                              width: "100%",
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              height: "180px",
                              backgroundColor: "#f1f5ff",
                              fontSize: "4rem",
                            }}
                          >
                            📄
                          </div>
                        )}

                        {/* File Info */}
                        <div className="p-3">
                          <p
                            className="fw-semibold mb-2 text-truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </small>

                            <button
                              className="btn btn-sm btn-danger rounded-circle"
                              onClick={() => handleRemoveFile(index)}
                              style={{
                                width: "32px",
                                height: "32px",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            className="btn btn-primary btn-lg mt-5"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              borderRadius: "14px",
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Analyzing Reports...
              </>
            ) : (
              `Analyze ${selectedFiles.length || ""} Report${
                selectedFiles.length > 1 ? "s" : ""
              }`
            )}
          </button>
        </div>

        {/* AI RESPONSE SECTION */}
        {response && (
          <div
            className="card border-0 shadow-lg p-4 mt-5 mx-auto"
            style={{
              maxWidth: "1000px",
              borderRadius: "20px",
            }}
          >
            {/* Top Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h3 className="fw-bold text-dark mb-0">AI Analysis Result</h3>

              <span className="badge bg-primary px-4 py-2 fs-6">
                {response?.report_type || "Medical Report"}
              </span>
            </div>

            {/* Summary */}
            <div
              className="p-4 rounded mb-4"
              style={{
                backgroundColor: "#f8f9ff",
              }}
            >
              <h5 className="fw-bold mb-3 text-primary">Summary</h5>

              <p
                className="text-dark mb-0"
                style={{
                  lineHeight: "1.8",
                  fontSize: "1rem",
                }}
              >
                {response?.summary}
              </p>
            </div>

            <div className="row g-4">
              {/* Abnormalities */}
              <div className="col-lg-6">
                <div
                  className="h-100 p-4 rounded shadow-sm"
                  style={{
                    backgroundColor: "#fff5f5",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-danger mb-0">Abnormalities</h5>

                    <span className="badge bg-danger">
                      {response?.abnormalities?.length || 0}
                    </span>
                  </div>

                  <div
                    style={{
                      maxHeight: "600px",
                      overflowY: "auto",
                      paddingRight: "5px",
                    }}
                  >
                    {Array.isArray(response?.abnormalities) &&
                    response.abnormalities.length > 0 ? (
                      response.abnormalities.map((abn, index) => (
                        <div
                          key={index}
                          className="mb-3 p-3 rounded-4 bg-white border shadow-sm"
                          style={{
                            borderLeft: "5px solid #dc3545",
                          }}
                        >
                          {typeof abn === "string" ? (
                            <div>{abn}</div>
                          ) : (
                            <>
                              {/* Top */}
                              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                <h6 className="fw-bold text-dark mb-0">
                                  {abn.test}
                                </h6>

                                <div className="d-flex gap-2 flex-wrap">
                                  <span className="badge bg-light text-dark border">
                                    {abn.value}
                                  </span>

                                  <span
                                    className={`badge ${
                                      abn.status === "High"
                                        ? "bg-danger"
                                        : abn.status === "Low"
                                          ? "bg-warning text-dark"
                                          : abn.status === "Critical"
                                            ? "bg-dark"
                                            : "bg-secondary"
                                    }`}
                                  >
                                    {abn.status}
                                  </span>
                                </div>
                              </div>

                              {/* Reference */}
                              <p className="mb-1 text-muted">
                                <strong>Reference Range:</strong>{" "}
                                {abn.reference_range}
                              </p>

                              {/* Reason */}
                              <p
                                className="mb-0 mt-2 text-secondary"
                                style={{
                                  fontSize: "0.95rem",
                                  lineHeight: "1.5",
                                }}
                              >
                                {abn.reason}
                              </p>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No abnormalities detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Possible Concerns */}
              <div className="col-lg-6">
                <div
                  className="h-100 p-4 rounded shadow-sm"
                  style={{
                    backgroundColor: "#fffaf0",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-warning mb-0">
                      Possible Concerns
                    </h5>

                    <span className="badge bg-warning text-dark">
                      {response?.possible_concerns?.length || 0}
                    </span>
                  </div>

                  {Array.isArray(response?.possible_concerns) &&
                  response.possible_concerns.length > 0 ? (
                    response.possible_concerns.map((concern, index) => (
                      <div
                        key={index}
                        className="mb-3 p-3 rounded-4 bg-white border shadow-sm"
                        style={{
                          borderLeft: "5px solid #ffc107",
                        }}
                      >
                        {concern}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No major concerns detected</p>
                  )}
                </div>
              </div>

              {/* Precautions */}
              <div className="col-12">
                <div
                  className="p-4 rounded shadow-sm"
                  style={{
                    backgroundColor: "#f4fff7",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-success mb-0">Precautions</h5>

                    <span className="badge bg-success">
                      {response?.precautions?.length || 0}
                    </span>
                  </div>

                  <div className="row">
                    {Array.isArray(response?.precautions) &&
                    response.precautions.length > 0 ? (
                      response.precautions.map((item, index) => (
                        <div className="col-md-6 mb-3" key={index}>
                          <div
                            className="p-3 rounded-4 bg-white border shadow-sm h-100"
                            style={{
                              borderLeft: "5px solid #198754",
                            }}
                          >
                            {item}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No precautions available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specialist + Consultation */}
              <div className="col-12">
                <div
                  className="p-4 rounded shadow-sm"
                  style={{
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div className="row align-items-center">
                    {/* Specialist */}
                    <div className="col-md-6 mb-3 mb-md-0">
                      <h6 className="fw-bold text-secondary mb-2">
                        Recommended Specialist
                      </h6>

                      <span className="badge bg-dark px-3 py-2 fs-6">
                        {response?.recommended_specialist ||
                          "General Physician"}
                      </span>
                    </div>

                    {/* Consultation */}
                    <div className="col-md-6">
                      <h6 className="fw-bold text-secondary mb-2">
                        Doctor Consultation
                      </h6>

                      {response?.doctor_consultation_needed ? (
                        <span className="badge bg-danger px-3 py-2 fs-6">
                          Consultation Recommended
                        </span>
                      ) : (
                        <span className="badge bg-success px-3 py-2 fs-6">
                          No Immediate Consultation Needed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiReportAnalysis;
