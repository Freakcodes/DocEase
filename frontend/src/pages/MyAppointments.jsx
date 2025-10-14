import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { token, backEndUrl, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState();
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();

  const getAppointedDoctors = async () => {
    const { data } = await axios.get(backEndUrl + "/api/user/list-appointments", {
      headers: { usertoken: token },
    });
    if (data.success) {
      setAppointments(data.appointments.reverse());
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

  const appointmentRazorpay = async (appointments) => {
    try {
      const { data } = await axios.post(
        backEndUrl + "/api/user/payment-razorpay",
        { appointmentId: appointments._id },
        { headers: { usertoken: token } }
      );
      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancelAppointment = async (appointments) => {
    const { data } = await axios.post(
      backEndUrl + "/api/user/cancel-appointments",
      { appointmentId: appointments._id },
      { headers: { usertoken: token } }
    );
    if (data.success) {
      toast.success("Appointment Cancelled");
      getAppointedDoctors();
      getDoctorsData();
    } else {
      toast.error(data.message);
    }
  };

  useEffect(() => {
    getAppointedDoctors();
  }, [token]);

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5 text-primary">
         My Appointments
      </h2>

      <div className="row g-4">
        {appointments &&
          appointments.map((appointment, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100 appointment-card">
                <div className="position-relative">
                  <img
                    src={appointment.docData.image}
                    alt="Doctor"
                    className="card-img-top"
                    style={{ height: "220px", objectFit: "contain" }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex justify-content-end p-2">
                    {appointment.cancelled ? (
                      <span className="badge bg-danger px-3 py-2 shadow">
                        Cancelled
                      </span>
                    ) : appointment.payment ? (
                      <span className="badge bg-success px-3 py-2 shadow">
                        Paid
                      </span>
                    ) : (
                      <span className="badge bg-warning text-dark px-3 py-2 shadow">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold text-dark mb-1">
                    {appointment.docData.name}
                  </h5>
                  <p className="text-muted mb-3">
                    {appointment.docData.speciality}
                  </p>

                  <div className="small text-secondary mb-3">
                    <strong>📍 Address:</strong>
                    <div>{appointment.docData.address.line1}</div>
                    <div>{appointment.docData.address.line2}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                    <div>
                      <div className="fw-semibold text-primary">
                        {appointment.slotDate}
                      </div>
                      <div className="text-muted">{appointment.slotTime}</div>
                    </div>

                    {!appointment.cancelled && (
                      <div className="d-flex flex-column align-items-end gap-2">
                        {!appointment.payment ? (
                          <button
                            className="btn btn-sm btn-success px-3 shadow-sm"
                            onClick={() => appointmentRazorpay(appointment)}
                          >
                            💳 Pay Online
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-secondary px-3 shadow-sm"
                            disabled
                          >
                            ✅ Payment Done
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger px-3 shadow-sm"
                          onClick={() => {
                            setShowModal(true);
                            setSelectedAppointment(appointment);
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg text-center"
            style={{ width: "400px" }}
          >
            <h5 className="fw-bold text-danger mb-3">
              Cancel Appointment ❗
            </h5>
            <p className="mb-4 text-muted">
              Are you sure you want to cancel your appointment with{" "}
              <strong>{selectedAppointment?.docData.name}</strong>?
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-danger px-4"
                onClick={() => {
                  handleCancelAppointment(selectedAppointment);
                  setShowModal(false);
                }}
              >
                Yes, Cancel
              </button>
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => setShowModal(false)}
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
