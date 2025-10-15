import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const Dashboard = () => {
  const { dashboardData, getDashboardData, adminToken } =
    useContext(AdminContext);

  useEffect(() => {
    if(adminToken)getDashboardData();
   
  }, [adminToken]);
  return (
    <div className="margin-left-side  py-4">
    <h4 className="fw-semibold mb-4">Welcome to the Dashboard</h4>
  
    {/* Stats cards */}
    <div className="row g-4 mb-4">
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
    </div>
  
    {/* Latest Appointments */}
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h6 className="fw-semibold mb-3">
          <i className="fas fa-clock me-2 text-primary"></i>Latest Appointments
        </h6>
  
        {dashboardData?.latestAppointments?.length > 0 ? (
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
                  Booking on <span className="text-primary">{appointments.slotDate}</span>{" "}
                  at <span className="text-primary">{appointments.slotTime}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted small mb-0">No recent appointments found.</p>
        )}
      </div>
    </div>
  </div>
  
  );
};

export default Dashboard;
