import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Shimmer from "../components/Shimmer";

const MyAppointments = () => {
  const { token, backEndUrl, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const isLoading = appointments.length === 0 || !appointments;

  const getAppointedDoctors = async () => {
    const { data } = await axios.get(
      backEndUrl + "/api/user/list-appointments",
      { headers: { usertoken: token } }
    );
    if (data.success) {
      setAppointments(data.appointments.reverse());
      console.log(data.appointments);
      
    } else {
      toast.error(data.message);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          console.log(response);
          
          const { data } = await axios.post(
            backEndUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { usertoken: token } }
          );
          if (data.success) {
            getAppointedDoctors();
            navigate("/appointments");
          }
        } catch (error) {
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointment) => {
    try {
      const { data } = await axios.post(
        backEndUrl + "/api/user/payment-razorpay",
        { appointmentId: appointment._id },
        { headers: { usertoken: token } }
      );
      if (data.success) initPay(data.order);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    try {
      setCancellingId(appointment._id);
      const { data } = await axios.post(
        backEndUrl + "/api/user/cancel-appointments",
        { appointmentId: appointment._id },
        { headers: { usertoken: token } }
      );
      if (data.success) {
        toast.success("Appointment Cancelled");
        getAppointedDoctors();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } finally {
      setCancellingId(null);
      setShowModal(false);
    }
  };

  useEffect(() => { getAppointedDoctors(); }, [token]);

  const active = appointments.filter((a) => !a.cancelled);

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1170px" }}>

        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="mb-5">
          
          <h4 className="fw-bold mb-0">My Appointments</h4>
          <p className="text-muted small mt-1">
            {active.length} active appointment{active.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── List ──────────────────────────────────────────────── */}
        {isLoading ? (
          <Shimmer />
        ) : active.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x text-muted" style={{ fontSize: "3rem" }}></i>
            <p className="text-muted mt-3 fw-medium">No appointments found</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {active.map((appointment, index) => {
              const doc = appointment.docData;
              const isPaid = appointment.payment;
              const isDone = appointment.isCompleted;

              return (
                <div
                  key={index}
                  className="card border-0 shadow-sm rounded-4 overflow-hidden"
                >
                  {/* Top accent */}
                  <div
                    className={isPaid ? "bg-success" : "bg-warning"}
                    style={{ height: "3px" }}
                  />

                  <div className="card-body p-4">
                    <div className="row g-3 align-items-center">

                      {/* ── Doctor Photo ── */}
                      <div className="col-auto">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="rounded-3"
                          style={{ width: "72px", height: "80px", objectFit: "cover" }}
                        />
                      </div>

                      {/* ── Doctor Info ── */}
                      <div className="col">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0">{doc.name}</h6>
                          {isDone && (
                            <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                              <i className="bi bi-check-circle me-1"></i>Completed
                            </span>
                          )}
                          {!isDone && (
                            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 small">
                              <i className="bi bi-clock me-1"></i>Upcoming
                            </span>
                          )}
                        </div>

                        <p className="text-muted small mb-2">{doc.speciality}</p>

                        <div className="d-flex flex-wrap gap-3 small text-secondary">
                          <span>
                            <i className="bi bi-calendar3 me-1 text-primary"></i>
                            {appointment.slotDate}
                          </span>
                          <span>
                            <i className="bi bi-clock me-1 text-primary"></i>
                            {appointment.slotTime}
                          </span>
                          <span>
                            <i className="bi bi-geo-alt me-1 text-primary"></i>
                            {doc.address?.line1}
                          </span>
                        </div>
                      </div>

                      {/* ── Actions ── */}
                      <div className="col-12 col-md-auto d-flex flex-row flex-md-column gap-2 justify-content-start justify-content-md-end">
                        {/* Payment */}
                        {!isPaid ? (
                          <button
                            className="btn btn-sm btn-success rounded-3 px-3 fw-semibold"
                            onClick={() => appointmentRazorpay(appointment)}
                          >
                            <i className="bi bi-credit-card me-1"></i>Pay Now
                          </button>
                        ) : (
                          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-3 text-center">
                            <i className="bi bi-check-circle-fill me-1"></i>Paid
                          </span>
                        )}

                        {/* View Details */}
                        {isPaid && isDone && (
                          <button
                            className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-semibold"
                            onClick={() => navigate(`/my-appointments/${appointment._id}`)}
                          >
                            <i className="bi bi-file-earmark-text me-1"></i>View Report
                          </button>
                        )}

                        {/* Cancel */}
                        <button
                          className="btn btn-sm btn-outline-danger rounded-3 px-3 fw-semibold"
                          onClick={() => { setShowModal(true); setSelectedAppointment(appointment); }}
                        >
                          <i className="bi bi-x-circle me-1"></i>Cancel
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cancel Modal ──────────────────────────────────────────── */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1050 }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4"
            style={{ width: "100%", maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "48px", height: "48px" }}
              >
                <i className="bi bi-exclamation-triangle text-danger fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Cancel Appointment</h6>
                <p className="text-muted small mb-0">This action cannot be undone</p>
              </div>
            </div>

            <hr className="my-3" />

            {/* Doctor info inside modal */}
            <div className="d-flex align-items-center gap-3 bg-light rounded-3 p-3 mb-4">
              <img
                src={selectedAppointment?.docData?.image}
                alt=""
                className="rounded-circle"
                style={{ width: "44px", height: "44px", objectFit: "cover" }}
              />
              <div>
                <p className="fw-bold mb-0 small">{selectedAppointment?.docData?.name}</p>
                <p className="text-muted mb-0 small">
                  {selectedAppointment?.slotDate} &bull; {selectedAppointment?.slotTime}
                </p>
              </div>
            </div>

            <p className="text-secondary small mb-4">
              Are you sure you want to cancel this appointment? The slot will be released and you may need to rebook.
            </p>

            <div className="d-flex gap-2">
              <button
                className="btn btn-danger flex-grow-1 fw-semibold"
                onClick={() => handleCancelAppointment(selectedAppointment)}
                disabled={!!cancellingId}
              >
                {cancellingId
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Cancelling...</>
                  : "Yes, Cancel Appointment"
                }
              </button>
              <button
                className="btn btn-outline-secondary px-4 fw-semibold"
                onClick={() => setShowModal(false)}
              >
                Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
