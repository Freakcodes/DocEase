import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
// import { dashboardData } from "../../../../backend/controllers/doctor.controller";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorDashboard = () => {
  const { dashData, doctortoken, getDashboardData, backendUrl } =
    useContext(DoctorContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (doctortoken) {
        setLoading(true);
        await getDashboardData();
        setLoading(false);
      }
    };
    fetchData();
  }, [doctortoken]);

  const getAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    return new Date().getFullYear() - birth.getFullYear();
  };

  const handleMark = async (appointment) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/mark-appointment",
        { appointmentId: appointment._id },
        { headers: { doctortoken: doctortoken } }
      );
      if (data.success) {
        toast.success(data.message);
        getDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Shimmer for stats cards
  const ShimmerCard = () => (
    <div className="col-md-4">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div style={{ flex: 1 }}>
            <div className="shimmer-line mb-2" style={{ width: "60%", height: "18px" }}></div>
            <div className="shimmer-line" style={{ width: "40%", height: "24px" }}></div>
          </div>
          <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
            <div className="shimmer-line rounded-circle" style={{ width: "32px", height: "32px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Shimmer for table rows
  const ShimmerRow = () => (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="py-3">
          <div className="shimmer-line" style={{ height: "20px" }}></div>
        </td>
      ))}
      <td className="py-3 text-center">
        <div className="shimmer-line rounded-circle" style={{ width: "32px", height: "32px", margin: "0 auto" }}></div>
      </td>
    </tr>
  );

  return (
    <div className="margin-left-side py-4">
      <h4 className="text-primary fw-bold mb-4">
        <i className="fas fa-tachometer-alt me-2"></i>Welcome to the Dashboard
      </h4>

      {loading ? (
        <div>
          {/* Shimmer Top Stats */}
          <div className="row g-4 mb-4">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>

          {/* Shimmer Table */}
          <div className="table-responsive bg-white shadow-sm rounded-4 p-3">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Date &amp; Time</th>
                  <th>Fees</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ShimmerRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        dashData && (
          <div>
            {/* Top Stats */}
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-uppercase text-muted mb-2">Earnings</h6>
                      <h4 className="fw-bold text-primary">${dashData?.earnings || 0}</h4>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <i className="fas fa-dollar-sign text-primary fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-uppercase text-muted mb-2">Appointments</h6>
                      <h4 className="fw-bold text-primary">{dashData?.appointments || 0}</h4>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <i className="fas fa-calendar-check text-primary fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-uppercase text-muted mb-2">Patients</h6>
                      <h4 className="fw-bold text-primary">{dashData?.patients || 0}</h4>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                      <i className="fas fa-user-injured text-primary fs-4"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Appointments Table */}
            <div>
              <h5 className="text-primary mb-3">
                <i className="fas fa-clock me-2"></i>Latest Appointments
              </h5>

              <div className="table-responsive bg-white shadow-sm rounded-4 p-3">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="fw-semibold text-secondary">#</th>
                      <th scope="col" className="fw-semibold text-secondary">Patient</th>
                      <th scope="col" className="fw-semibold text-secondary">Age</th>
                      <th scope="col" className="fw-semibold text-secondary">Date &amp; Time</th>
                      <th scope="col" className="fw-semibold text-secondary">Fees</th>
                      <th scope="col" className="text-center fw-semibold text-secondary">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashData?.latestAppointments && dashData?.latestAppointments.length > 0 ? (
                      dashData.latestAppointments.map((apt, index) => {
                        const user = apt.userData;
                        const doc = apt.docData;
                        return !apt.cancelled && (
                          <tr key={index} className="border-bottom">
                            <td className="py-3 fw-semibold text-primary">{index + 1}</td>
                            <td className="py-3">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={user?.image}
                                  alt={user?.name}
                                  className="rounded-circle border"
                                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                                <span className="fw-medium text-dark">{user?.name || "-"}</span>
                              </div>
                            </td>
                            <td className="py-3 text-muted">{getAge(user?.dob)}</td>
                            <td className="py-3 text-muted">{apt.slotDate}, {apt.slotTime}</td>
                            <td className="py-3 fw-semibold text-primary">${doc?.fees || 0}</td>
                            <td className="py-3 text-center">
                              {apt.isCompleted ? (
                                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                                  <i className="fas fa-check-circle me-1"></i>Completed
                                </span>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-success rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                  style={{ width: "32px", height: "32px" }}
                                  title="Mark as Completed"
                                  onClick={() => handleMark(apt)}
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-5 fs-6 fw-medium">
                          <i className="fas fa-info-circle me-2"></i>No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DoctorDashboard;
