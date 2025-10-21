import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import AdminChatPanel from "./AdminChatPanel";

const Dashboard = () => {
  const { dashboardData, getDashboardData, adminToken, backendUrl } =
    useContext(AdminContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminToken) {
      setLoading(true);
      getDashboardData().finally(() => setLoading(false));
    }
  }, [adminToken]);

  return (
    <div className="margin-left-side py-4">
      <h4 className="fw-semibold mb-4">Welcome to the Dashboard</h4>

      {/* Stats cards */}
      <div className="row g-4 mb-4">
        {loading ? (
          // shimmer for 3 cards
          Array.from({ length: 3 }).map((_, i) => (
            <div className="col-md-4" key={i}>
              <div className="card text-center shadow-sm border-0">
                <div className="card-body">
                  <div className="shimmer-circle mx-auto mb-2"></div>
                  <div className="shimmer-line mx-auto mb-1" style={{ width: "40%", height: "20px" }}></div>
                  <div className="shimmer-line mx-auto" style={{ width: "60%", height: "12px" }}></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="col-md-4">
              <div className="card text-center shadow-sm border-0">
                <div className="card-body">
                  <i className="fas fa-user-md fa-2x text-primary mb-2"></i>
                  <h5 className="fw-bold mb-1">{dashboardData.doctors}</h5>
                  <p className="text-muted mb-0">Doctors</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center shadow-sm border-0">
                <div className="card-body">
                  <i className="fas fa-calendar-check fa-2x text-success mb-2"></i>
                  <h5 className="fw-bold mb-1">{dashboardData.appointments}</h5>
                  <p className="text-muted mb-0">Appointments</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center shadow-sm border-0">
                <div className="card-body">
                  <i className="fas fa-users fa-2x text-warning mb-2"></i>
                  <h5 className="fw-bold mb-1">{dashboardData.patients}</h5>
                  <p className="text-muted mb-0">Patients</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Latest Appointments */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">
            <i className="fas fa-clock me-2 text-primary"></i>Latest Appointments
          </h6>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                className="d-flex align-items-center border-bottom py-2"
                key={i}
              >
                <div
                  className="shimmer-circle me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                  }}
                ></div>
                <div style={{ flex: 1 }}>
                  <div
                    className="shimmer-line mb-1"
                    style={{ width: "40%", height: "14px" }}
                  ></div>
                  <div
                    className="shimmer-line"
                    style={{ width: "70%", height: "10px" }}
                  ></div>
                </div>
              </div>
            ))
          ) : dashboardData?.latestAppointments?.length > 0 ? (
            dashboardData.latestAppointments.map((appointments, index) => (
              <div
                className="d-flex align-items-center border-bottom py-2"
                key={index}
              >
                <img
                  src={appointments.userData.image}
                  alt="Doctor"
                  className="rounded-circle me-3 border"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div>
                  <p className="fw-bold mb-1">{appointments.docData.name}</p>
                  <p className="text-muted mb-0 small">
                    Booking on{" "}
                    <span className="text-primary">
                      {appointments.slotDate}
                    </span>{" "}
                    at{" "}
                    <span className="text-primary">
                      {appointments.slotTime}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted small mb-0">
              No recent appointments found.
            </p>
          )}
        </div>
      </div>

      <AdminChatPanel backendUrl={backendUrl} aToken={adminToken} />

      {/* Shimmer CSS */}
      <style jsx>{`
        .shimmer-line,
        .shimmer-circle {
          position: relative;
          overflow: hidden;
          background: #e0e0e0;
        }
        .shimmer-line::before,
        .shimmer-circle::before {
          content: "";
          position: absolute;
          top: 0;
          left: -150px;
          height: 100%;
          width: 150px;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 100%;
          }
        }
        .shimmer-circle {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
