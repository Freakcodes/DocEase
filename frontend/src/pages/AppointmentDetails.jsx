import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { pdf } from "@react-pdf/renderer";
import AppointmentPDF from "../components/AppointmentPDF";

const AppointmentDetails = () => {
  const { id } = useParams();
  const { token, backEndUrl } = useContext(AppContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // ── Report upload state (per test, keyed by test index) ───────────────
  // Shape: { [testIndex]: { file, preview, uploading } }
  const [reportUploads, setReportUploads] = useState({});

  const downloadPDF = async (appointment) => {
    try {
      setDownloading(true);
      const blob = await pdf(<AppointmentPDF appointment={appointment} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DocEase_Report_${appointment.slotDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const getAppointment = async () => {
    try {
      const { data } = await axios.post(
        backEndUrl + "/api/user/appointment",
        { appointmentId: id },
        { headers: { usertoken: token } }
      );
      if (data.success) {
        setAppointment(data.appointmentData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Report upload handlers (per test) ────────────────────────────────
  const handleReportFileChange = (testIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReportUploads((prev) => ({
      ...prev,
      [testIndex]: {
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        uploading: false,
      },
    }));
  };

  const removeSelectedFile = (testIndex) => {
    setReportUploads((prev) => {
      const next = { ...prev };
      delete next[testIndex];
      return next;
    });
  };

  const handleReportUpload = async (testIndex, testName) => {
    const entry = reportUploads[testIndex];
    if (!entry?.file) {
      toast.warn("Please select a file first");
      return;
    }
    try {
      setReportUploads((prev) => ({
        ...prev,
        [testIndex]: { ...prev[testIndex], uploading: true },
      }));

      const formData = new FormData();
      formData.append("report", entry.file);
      formData.append("appointmentId", id);
      formData.append("testName", testName);
      formData.append("docId", appointment.docId);
      // TODO: replace with actual endpoint
      const { data } = await axios.post(
        backEndUrl + "/api/user/upload-test-report",
        formData,
        { headers: { usertoken: token } }
      );

      if (data.success) {
        toast.success(`Report for "${testName}" uploaded successfully`);
        console.log(data.fileUrl);
        removeSelectedFile(testIndex);
        getAppointment();
      } else {
        toast.error(data.message || "Failed to upload report");
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload report");
      setReportUploads((prev) => ({
        ...prev,
        [testIndex]: { ...prev[testIndex], uploading: false },
      }));
    }
  };

  useEffect(() => {
    if (id) getAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted fw-medium">Fetching appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <i className="bi bi-file-earmark-x text-muted" style={{ fontSize: "3rem" }}></i>
          <p className="text-muted mt-3 fw-medium">No appointment data found</p>
        </div>
      </div>
    );
  }

  const doc = appointment.docData;
  const notes = appointment.doctorNotes;

  const statusBadge = appointment.cancelled
    ? { cls: "bg-danger", label: "Cancelled" }
    : appointment.isCompleted
    ? { cls: "bg-success", label: "Completed" }
    : { cls: "bg-warning text-dark", label: "Upcoming" };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1170px" }}>

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
          <div>
            <p className="text-primary fw-semibold mb-1 small text-uppercase ls-1">
              <i className="bi bi-clipboard2-pulse me-1"></i> Medical Report
            </p>
            <h4 className="fw-bold mb-0 text-dark">Appointment Details</h4>
          </div>
          <button
            className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
            onClick={() => downloadPDF(appointment)}
            disabled={downloading}
          >
            {downloading
              ? <><span className="spinner-border spinner-border-sm" role="status"></span> Generating...</>
              : <><i className="bi bi-download"></i> Download Report</>
            }
          </button>
        </div>

        {/* ── Doctor Card ─────────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          {/* Teal top accent */}
          <div className="bg-primary" style={{ height: "4px" }}></div>
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row gap-4 align-items-md-center">

              {/* Avatar */}
              <div className="flex-shrink-0 text-center">
                <img
                  src={doc?.image}
                  alt={doc?.name}
                  className="rounded-circle border border-3 border-white shadow"
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              </div>

              {/* Info */}
              <div className="flex-grow-1">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h5 className="fw-bold mb-1">{doc?.name}</h5>
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-1 mb-2 d-inline-block">
                      {doc?.speciality}
                    </span>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-envelope me-2"></i>{doc?.email}
                    </p>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      {doc?.address?.line1}{doc?.address?.line2 ? `, ${doc?.address?.line2}` : ""}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="d-flex flex-md-column gap-2 align-items-start align-items-md-end justify-content-start">
                    <span className={`badge px-3 py-2 rounded-pill ${statusBadge.cls}`}>
                      {statusBadge.label}
                    </span>
                    <span className={`badge px-3 py-2 rounded-pill ${appointment.payment ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning-emphasis"}`}>
                      <i className={`bi ${appointment.payment ? "bi-check-circle" : "bi-clock"} me-1`}></i>
                      {appointment.payment ? "Paid" : "Payment Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Appointment Info ─────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold text-uppercase text-muted small mb-3 letter-spacing-1">
              <i className="bi bi-calendar3 me-2 text-primary"></i>Appointment Information
            </h6>
            <div className="row g-3">
              {[
                { icon: "bi-calendar-event", label: "Date", value: appointment.slotDate },
                { icon: "bi-clock",          label: "Time", value: appointment.slotTime },
                { icon: "bi-currency-rupee", label: "Consultation Fee", value: `₹${appointment.amount}` },
              ].map(({ icon, label, value }) => (
                <div className="col-12 col-md-4" key={label}>
                  <div className="rounded-3 p-3 h-100 border bg-white d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: "40px", height: "40px" }}>
                      <i className={`bi ${icon} text-primary`}></i>
                    </div>
                    <div>
                      <p className="text-muted small mb-0">{label}</p>
                      <p className="fw-bold mb-0">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Doctor Notes ─────────────────────────────────────────── */}
        {notes && (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase text-muted small mb-4">
                <i className="bi bi-file-earmark-medical me-2 text-primary"></i>Doctor Notes & Prescription
              </h6>

              {/* Notes */}
              {notes.notes && (
                <div className="rounded-3 border-start border-4 border-primary bg-white border p-4 mb-4">
                  <p className="small fw-bold text-muted text-uppercase mb-2">Consultation Notes</p>
                  <p className="mb-0 text-dark">{notes.notes}</p>
                </div>
              )}

              {/* Medicines */}
              {notes.medicines?.length > 0 && (
                <div className="mb-4">
                  <p className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px" }}>
                      <i className="bi bi-capsule text-primary small"></i>
                    </span>
                    Prescribed Medicines
                  </p>
                  <div className="table-responsive rounded-3 border overflow-hidden">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-dark" style={{ "--bs-table-bg": "#0d6efd" }}>
                        <tr>
                          <th className="fw-semibold py-3 ps-4">Medicine</th>
                          <th className="fw-semibold py-3">Dosage</th>
                          <th className="fw-semibold py-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notes.medicines.map((med, i) => (
                          <tr key={i}>
                            <td className="ps-4 fw-semibold py-3">{med.name}</td>
                            <td className="py-3 text-muted">{med.dosage}</td>
                            <td className="py-3 text-muted">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tests */}
              {notes.tests?.length > 0 && (
                <div className="mb-4">
                  <p className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px" }}>
                      <i className="bi bi-clipboard2-pulse text-primary small"></i>
                    </span>
                    Recommended Tests
                  </p>
                  <div className="d-flex flex-column gap-3">
                    {notes.tests.map((test, i) => {
                      const entry = reportUploads[i];
                      // ✅ uploaded URL lives directly on the test object now
                      const uploadedUrl = test.reportUrl;

                      return (
                        <div key={i} className="border rounded-3 bg-white p-3">
                          {/* Test name row */}
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-check-circle-fill text-success flex-shrink-0"></i>
                            <span className="fw-medium">{test.testName}</span>
                          </div>

                          {/* ✅ Already uploaded → show link instead of upload widget */}
                          {uploadedUrl ? (
                            <div className="d-flex align-items-center gap-3 bg-success bg-opacity-10 border border-success-subtle rounded-3 p-3">
                              <div
                                className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: "48px", height: "48px" }}
                              >
                                <i className="bi bi-file-earmark-check text-success fs-5"></i>
                              </div>
                              <div className="flex-grow-1 overflow-hidden">
                                <p className="fw-semibold small mb-0">Report uploaded</p>
                                <p className="text-muted small mb-0 text-truncate">{test.testName}</p>
                              </div>
                              <a
                                href={uploadedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-success rounded-3 flex-shrink-0 fw-semibold px-3"
                              >
                                <i className="bi bi-eye me-1"></i>View
                              </a>
                            </div>
                          ) : !entry?.file ? (
                            <label
                              htmlFor={`reportUpload-${i}`}
                              className="d-flex align-items-center justify-content-center gap-2 rounded-3 border border-2 border-primary border-opacity-25 bg-light py-3 px-3"
                              style={{ cursor: "pointer", borderStyle: "dashed" }}
                            >
                              <i className="bi bi-cloud-arrow-up text-primary"></i>
                              <span className="fw-semibold small text-primary">
                                Upload report for this test
                              </span>
                              <span className="text-muted small">&middot; PDF, JPG, PNG &middot; up to 10MB</span>
                              <input
                                id={`reportUpload-${i}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="d-none"
                                onChange={(e) => handleReportFileChange(i, e)}
                              />
                            </label>
                          ) : (
                            <div className="d-flex align-items-center gap-3 bg-light border rounded-3 p-3">
                              {entry.preview ? (
                                <img
                                  src={entry.preview}
                                  alt="preview"
                                  className="rounded-3 flex-shrink-0"
                                  style={{ width: "48px", height: "48px", objectFit: "cover" }}
                                />
                              ) : (
                                <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{ width: "48px", height: "48px" }}>
                                  <i className="bi bi-file-earmark-pdf text-primary fs-5"></i>
                                </div>
                              )}

                              <div className="flex-grow-1 overflow-hidden">
                                <p className="fw-semibold small mb-0 text-truncate">{entry.file.name}</p>
                                <p className="text-muted small mb-0">
                                  {(entry.file.size / 1024).toFixed(0)} KB
                                </p>
                              </div>

                              <button
                                className="btn btn-sm btn-outline-danger rounded-3 flex-shrink-0"
                                onClick={() => removeSelectedFile(i)}
                                disabled={entry.uploading}
                              >
                                <i className="bi bi-trash"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-primary rounded-3 flex-shrink-0 fw-semibold px-3"
                                onClick={() => handleReportUpload(i, test.testName)}
                                disabled={entry.uploading}
                              >
                                {entry.uploading
                                  ? <span className="spinner-border spinner-border-sm" role="status"></span>
                                  : <><i className="bi bi-upload me-1"></i>Upload</>
                                }
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {notes.followUpDate && (
                <div className="rounded-3 border border-info-subtle bg-info bg-opacity-10 p-4 d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-info bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "44px", height: "44px" }}>
                    <i className="bi bi-calendar-plus text-info fs-5"></i>
                  </div>
                  <div>
                    <p className="small fw-bold text-muted text-uppercase mb-1">Follow-up Appointment</p>
                    <p className="fw-bold text-dark mb-0">{notes.followUpDate}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AppointmentDetails;
