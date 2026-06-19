import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

// ── Helper: normalize slotDate to "YYYY-MM-DD" so it can be compared
//    against the value of an <input type="date">. This project's
//    slotDate is commonly stored as "D_M_YYYY" (e.g. "21_6_2026").
//    Adjust this if your backend stores dates differently. ──────────
const slotDateToISO = (slotDate) => {
  if (!slotDate) return "";

  // Already in YYYY-MM-DD form
  if (/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) return slotDate;

  // "D_M_YYYY", "D-M-YYYY", or "D/M/YYYY" (day_month_year, any separator)
  const dmySeparated = slotDate.match(/^(\d{1,2})[_\-/](\d{1,2})[_\-/](\d{4})$/);
  if (dmySeparated) {
    const [, day, month, year] = dmySeparated;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Fallback: let the browser try to parse it (handles things like
  // "Jun 21 2026", full ISO timestamps, etc.)
  const parsed = new Date(slotDate);
  if (!isNaN(parsed)) return parsed.toISOString().split("T")[0];

  // Couldn't parse — log once so it's easy to spot in devtools instead
  // of silently filtering everything out.
  console.warn("slotDateToISO: unrecognized slotDate format:", slotDate);
  return slotDate;
};

// ── Shimmer row, defined outside the component so it isn't recreated
//    on every render ──────────────────────────────────────────────────
const ShimmerRow = () => (
  <tr>
    {Array.from({ length: 9 }).map((_, i) => (
      <td key={i} className="py-3">
        <div className="shimmer-line" style={{ height: "20px" }}></div>
      </td>
    ))}
  </tr>
);

const Appointments = () => {
  const { getAllAppointments, appointments, adminToken, backendUrl } =
    useContext(AdminContext);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (adminToken) {
        setLoading(true);
        await getAllAppointments();
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [adminToken]);

  // Reset to page 1 whenever the filters change, so the user isn't
  // stuck on a page that no longer has results.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

  const handleCancel = async (appointment) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId: appointment._id },
        { headers: { admintoken: adminToken } },
      );
      if (data.success) {
        toast.success("Appointment Cancelled");
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    return new Date().getFullYear() - birth.getFullYear();
  };

  const handleMarkPayment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/update-payment",
        { appointmentId },
        { headers: { adminToken } },
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments(); // refresh UI
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────
  const filteredAppointments = (appointments || []).filter((apt) => {
    const docName = apt.docData?.name?.toLowerCase() || "";
    const matchesSearch = docName.includes(searchTerm.trim().toLowerCase());
    const matchesDate = !filterDate || slotDateToISO(apt.slotDate) === filterDate;
    return matchesSearch && matchesDate;
  });

  // ── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE));
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
  };

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <div className="margin-left-side mt-4 px-3">
      <h4 className="fw-semibold mb-4">All Appointments</h4>

      {/* ── Search + Date Filter ──────────────────────────────────── */}
      <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
        <div className="position-relative" style={{ minWidth: "260px" }}>
          <i
            className="fas fa-search position-absolute text-muted"
            style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
          ></i>
          <input
            type="text"
            className="form-control rounded-3 ps-5"
            placeholder="Search by doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <input
          type="date"
          className="form-control rounded-3"
          style={{ maxWidth: "200px" }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        {(searchTerm || filterDate) && (
          <button
            className="btn btn-sm btn-outline-secondary rounded-3"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}

        <span className="text-muted small ms-auto">
          {filteredAppointments.length} appointment
          {filteredAppointments.length !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="table-responsive bg-white shadow-sm rounded-4 p-3">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Department</th>
              <th>Age</th>
              <th>Date &amp; Time</th>
              <th>Doctor</th>
              <th>Fees</th>
              <th>Payment</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <ShimmerRow key={i} />)
            ) : paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((apt, index) => {
                const user = apt.userData;
                const doc = apt.docData;
                return (
                  <tr key={apt._id || index} className="border-bottom">
                    <td className="py-3">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={user?.image}
                          alt={user?.name}
                          className="rounded-circle border"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                          }}
                        />
                        <span className="fw-medium text-dark">
                          {user?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">{doc?.speciality || "General"}</td>
                    <td className="py-3">{getAge(user?.dob)}</td>
                    <td className="py-3 text-muted">
                      {apt.slotDate}, {apt.slotTime}
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={doc?.image}
                          alt={doc?.name}
                          className="rounded-circle border"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                          }}
                        />
                        <span className="fw-medium">{doc?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-dark fw-semibold">
                      ${doc?.fees || 0}
                    </td>
                    <td className="py-3 text-center">
                      {apt.payment ? (
                        <span className="badge bg-success-subtle text-success px-3 py-2">
                          Paid
                        </span>
                      ) : (
                        <div className="d-flex flex-column align-items-center gap-2">
                          <span className="badge bg-warning-subtle text-warning px-3 py-2">
                            Pending
                          </span>

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleMarkPayment(apt._id)}
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {apt.cancelled ? (
                        <div className="text-danger">Cancelled</div>
                      ) : apt.isCompleted ? (
                        <span className="text-success fw-medium">
                          Completed
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center mx-auto"
                          style={{ width: "32px", height: "32px" }}
                          title="Cancel Appointment"
                          onClick={() => handleCancel(apt)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center text-muted py-5 fs-6 fw-medium"
                >
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {!loading && filteredAppointments.length > ITEMS_PER_PAGE && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">
            Page {currentPage} of {totalPages}
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary rounded-3"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left me-1"></i>Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, i, arr) => (
                <React.Fragment key={page}>
                  {i > 0 && arr[i - 1] !== page - 1 && (
                    <span className="px-1 text-muted">…</span>
                  )}
                  <button
                    className={`btn btn-sm rounded-3 ${
                      page === currentPage
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}

            <button
              className="btn btn-sm btn-outline-secondary rounded-3"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next<i className="fas fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;