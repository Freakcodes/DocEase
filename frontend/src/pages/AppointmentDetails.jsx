import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const AppointmentDetails = () => {
  const { id } = useParams();
  const { token, backEndUrl, } = useContext(AppContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (id) getAppointment();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-5">No data found</div>;
  }

  const doc = appointment.docData;
  const notes = appointment.doctorNotes;

  return (
    <div className="container mt-4">

      {/* Doctor Card */}
      <div className="card shadow-sm rounded-4 mb-4 p-3">
        <div className="d-flex align-items-center gap-3">
          <img
            src={doc?.image}
            alt={doc?.name}
            className="rounded-circle border"
            style={{ width: "70px", height: "70px", objectFit: "cover" }}
          />
          <div>
            <h5 className="fw-bold mb-0">{doc?.name}</h5>
            <p className="text-muted mb-1">{doc?.speciality}</p>
            <small className="text-secondary">
              {doc?.address?.line1}, {doc?.address?.line2}
            </small>
          </div>
        </div>
      </div>

      {/* Appointment Info */}
      <div className="card shadow-sm rounded-4 mb-4 p-3">
        <h6 className="fw-semibold mb-3">Appointment Details</h6>

        <div className="row">
          <div className="col-md-4">
            <strong>Date:</strong>
            <div>{appointment.slotDate}</div>
          </div>

          <div className="col-md-4">
            <strong>Time:</strong>
            <div>{appointment.slotTime}</div>
          </div>

          <div className="col-md-4">
            <strong>Status:</strong>
            <div>
              {appointment.cancelled ? (
                <span className="badge bg-danger">Cancelled</span>
              ) : appointment.isCompleted ? (
                <span className="badge bg-success">Completed</span>
              ) : (
                <span className="badge bg-warning text-dark">Pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <strong>Payment:</strong>{" "}
          {appointment.payment ? (
            <span className="badge bg-success">Paid</span>
          ) : (
            <span className="badge bg-warning text-dark">Pending</span>
          )}
        </div>
      </div>

      {/* Doctor Notes */}
      {notes && (
        <div className="card shadow-sm rounded-4 mb-4 p-3">
          <h6 className="fw-semibold mb-3">Doctor Notes</h6>

          {notes.notes && (
            <p className="text-dark">{notes.notes}</p>
          )}

          {/* Medicines */}
          {notes.medicines && notes.medicines.length > 0 && (
            <>
              <h6 className="fw-semibold mt-3">Medicines</h6>
              <ul className="list-group">
                {notes.medicines.map((med, i) => (
                  <li
                    key={i}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>{med.name}</span>
                    <span className="text-muted">
                      {med.dosage} | {med.duration}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Tests */}
          {notes.tests && notes.tests.length > 0 && (
            <>
              <h6 className="fw-semibold mt-3">Tests</h6>
              <ul className="list-group">
                {notes.tests.map((test, i) => (
                  <li key={i} className="list-group-item">
                    {test.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Follow Up */}
          {notes.followUpDate && (
            <div className="mt-3">
              <h6 className="fw-semibold">Follow-up</h6>
              <span className="badge bg-info text-dark">
                {notes.followUpDate}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;