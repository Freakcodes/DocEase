import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./Shimmer.css"; // ← add shimmer styles here

const Appointments = () => {
  const { getAllAppointments, appointments, adminToken, backendUrl } =
    useContext(AdminContext);

  const [loading, setLoading] = useState(true);

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

  const handleCancel = async (appointment) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId: appointment._id },
        { headers: { admintoken: adminToken } }
      );
      if (data.success) {
        toast.success("Appointment Cancelled");
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

  // shimmer loader
  const ShimmerRow = () => (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="py-3">
          <div className="shimmer-line" style={{ height: "20px" }}></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="margin-left-side mt-4 px-3">
      <h4 className="fw-semibold mb-4">All Appointments</h4>

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
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <ShimmerRow key={i} />)
            ) : appointments && appointments.length > 0 ? (
              appointments.map((apt, index) => {
                const user = apt.userData;
                const doc = apt.docData;
                return (
                  <tr key={index} className="border-bottom">
                    <td className="py-3">{index + 1}</td>
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
                      {apt.cancelled ? (
                        <div className="text-danger">Cancelled</div>
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
                  colSpan="8"
                  className="text-center text-muted py-5 fs-6 fw-medium"
                >
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
