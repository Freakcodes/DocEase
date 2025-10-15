import React, { useContext, useEffect,useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";
const DoctorAppointments = () => {
  const { getAppointments, appointments, doctortoken,backendUrl } =
    useContext(DoctorContext);

    const [filteredAppointments,setFilteredAppointments]=useState([]);
  const handleMark = async (appointment) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/mark-appointment",
        { appointmentId: appointment._id },
        { headers: { doctortoken: doctortoken } }
      );
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  useEffect(() => {
    if (doctortoken) {
      getAppointments();
      
    }
  }, [doctortoken]);
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setFilteredAppointments(appointments.filter(apt => apt.cancelled));
    }
  }, [appointments]);
 
  const getAge = (dob) => {
    console.log(dob);
    if (!dob) return "-";
    const birth = new Date(dob);
    let modi = new Date().getFullYear() - birth.getFullYear();
    return modi;
  };

  return (
    <div className="margin-left-side mt-4 px-3">
      <h4 className="fw-semibold mb-4">All Appointments</h4>

      <div className="table-responsive bg-white shadow-sm rounded-4 p-3">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" className="fw-semibold text-secondary">
                #
              </th>
              <th scope="col" className="fw-semibold text-secondary">
                Patient
              </th>
              <th scope="col" className="fw-semibold text-secondary">
                Age
              </th>

              <th scope="col" className="fw-semibold text-secondary">
                Date &amp; Time
              </th>

              <th scope="col" className="fw-semibold text-secondary">
                Fees
              </th>
              <th
                scope="col"
                className="text-center fw-semibold text-secondary"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments && filteredAppointments.length > 0 ? (
              appointments.map((apt, index) => {
                const user = apt.userData;
                const doc = apt.docData;

                return (
                  !apt.cancelled && (
                    <tr key={index} className="border-bottom">
                      <td className="py-3">{index + 1}</td>

                      {/* Patient */}
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

                      <td className="py-3 text-muted">
                        {apt.slotDate}, {apt.slotTime}
                      </td>

                      <td className="py-3">{getAge(user?.dob)}</td>

                      <td className="py-3 text-dark fw-semibold">
                        ${doc?.fees || 0}
                      </td>

                      {/* Cancel Button */}
                      <td className="py-3 text-center">
                        {apt.isCompleted ? (
                          <div className="text-success">Completed</div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-success rounded-circle d-flex align-items-center justify-content-center mx-auto"
                            style={{ width: "32px", height: "32px" }}
                            title="Cancel Appointment"
                            onClick={() => handleMark(apt)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
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

export default DoctorAppointments;
