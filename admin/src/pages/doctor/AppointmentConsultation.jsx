import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { useContext } from "react";

const AppointmentConsultation = () => {
  const { backendUrl, doctortoken } = useContext(DoctorContext);
  const [appointment, setAppointment] = useState({});
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState();
  const { id } = useParams();
  const isCompleted = appointment?.isCompleted;
  const getAppointment = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/doctor/appointment/${id}`,
        { headers: { doctortoken: doctortoken } },
      );
      if (data.success) {
        console.log(data);

        setAppointment(data.appointment);
        setUserId(data.appointment.userId);
      } else {
        toast.error(data.message);
      }
      console.log(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUserAppointmentHistory = async (userId) => {
    try {
      const { data } = await axios.get(
        backendUrl + `/api/doctor/appointment-history/${userId}`,
        { headers: { doctortoken: doctortoken } },
      );
      if (data.success) {
        // console.log(data.appointments);

        setHistory(data.appointments);
      } else {
        toast.error(data.message);
      }
      console.log(data);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    if (appointment?.isCompleted) {
      setDoctorNotes(appointment?.doctorNotes?.notes || "");

      setMedicines(
        appointment?.doctorNotes?.medicines?.length > 0
          ? appointment?.doctorNotes?.medicines
          : [
              {
                name: "",
                dosage: "",
                duration: "",
              },
            ],
      );

      setTests(
        appointment?.doctorNotes?.tests?.length > 0
          ? appointment?.doctorNotes?.tests
          : [""],
      );

      setFollowUpDate(appointment?.doctorNotes?.followUpDate || "");
    }
  }, [appointment]);

  useEffect(() => {
    getAppointment();
  }, [id]);

  useEffect(() => {
    if (userId) {
      getUserAppointmentHistory(userId);
    }
    console.log(history);
  }, [userId]);
  // =========================
  // STATES
  // =========================
  const [doctorNotes, setDoctorNotes] = useState("");

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      duration: "",
    },
  ]);

  const [tests, setTests] = useState([""]);

  const [followUpDate, setFollowUpDate] = useState("");

  // =========================
  // DUMMY DATA
  // =========================
  const patient = {
    name: appointment?.userData?.name,
    age: 24,
    image: appointment?.userData?.image,
    appointmentDate: appointment?.slotDate,
    appointmentTime: appointment?.slotTime,
    paymentStatus: appointment?.payment ? "Paid" : "Unpaid",
    status: "Appointment Active",
  };

  

  // =========================
  // MEDICINE FUNCTIONS
  // =========================
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];

    updatedMedicines[index][field] = value;

    setMedicines(updatedMedicines);
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        duration: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    const updatedMedicines = medicines.filter((_, i) => i !== index);

    setMedicines(updatedMedicines);
  };

  // =========================
  // TEST FUNCTIONS
  // =========================
  const handleTestChange = (index, value) => {
    const updatedTests = [...tests];

    updatedTests[index] = value;

    setTests(updatedTests);
  };

  const addTest = () => {
    setTests([...tests, ""]);
    console.log(tests);
  };

  const removeTest = (index) => {
    const updatedTests = tests.filter((_, i) => i !== index);

    setTests(updatedTests);
  };

  // =========================
  // FOLLOW UP BUTTONS
  // =========================
  const setFollowUp = (days) => {
    const today = new Date();

    today.setDate(today.getDate() + days);

    const formattedDate = today.toISOString().split("T")[0];

    setFollowUpDate(formattedDate);
  };

  // =========================
  // COMPLETE CONSULTATION
  // =========================
  const handleCompleteConsultation = async () => {
    try {
      // Validation
      if (!doctorNotes.trim()) {
        return toast.error("Doctor notes are required");
      }

      const filteredMedicines = medicines.filter(
        (med) =>
          med.name.trim() !== "" ||
          med.dosage.trim() !== "" ||
          med.duration.trim() !== "",
      );

      const filteredTests = tests.filter((test) => test.trim() !== "");

      const consultationData = {
        appointmentId: id,
        notes: doctorNotes,
        medicines: filteredMedicines,
        tests: filteredTests,
        followUpDate,
      };

      console.log(consultationData);

      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        consultationData,
        {
          headers: {
            doctortoken,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        // OPTIONAL RESET
        setDoctorNotes("");

        setMedicines([
          {
            name: "",
            dosage: "",
            duration: "",
          },
        ]);

        setTests([""]);

        setFollowUpDate("");

        // Refresh appointment
        getAppointment();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="margin-left-side bg-light min-vh-100 py-4 px-3">
      <div className="container-fluid">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1">Patient Consultation</h3>

            <p className="text-muted mb-0">
              Review patient history, prescribe medicines, and complete
              consultation
            </p>
          </div>

          {!isCompleted && (
            <button
              onClick={handleCompleteConsultation}
              className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
            >
              <i className="fas fa-check-circle me-2"></i>
              Complete Consultation
            </button>
          )}
        </div>

        <div className="row g-4">
          {/* LEFT SIDE */}
          <div className="col-lg-8">
            {/* PATIENT CARD */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={patient.image}
                    alt="Patient"
                    className="rounded-circle border"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />

                  <div>
                    <h5 className="fw-bold mb-1">{patient.name}</h5>

                    <p className="text-muted mb-1">Age: {patient.age}</p>

                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                      {patient.status}
                    </span>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <small className="text-muted">Appointment Date</small>

                    <div className="fw-semibold">{patient.appointmentDate}</div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <small className="text-muted">Appointment Time</small>

                    <div className="fw-semibold">{patient.appointmentTime}</div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <small className="text-muted">Payment Status</small>

                    <div>
                      <span className="badge bg-success">
                        {patient.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCTOR NOTES */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">
                  <i className="fas fa-notes-medical text-primary me-2"></i>
                  Doctor Notes
                </h5>

                {isCompleted ? (
                  <div className="p-3 bg-light rounded-3">
                    {doctorNotes || "No notes added"}
                  </div>
                ) : (
                  <textarea
                    className="form-control rounded-3"
                    rows="4"
                    placeholder="Write consultation notes..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* MEDICINES */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold mb-0">
                    <i className="fas fa-capsules text-success me-2"></i>
                    Prescribed Medicines
                  </h5>
                  {isCompleted ? (
                    <></>
                  ) : (
                    <button
                      onClick={addMedicine}
                      className="btn btn-sm btn-outline-primary rounded-pill"
                    >
                      + Add Medicine
                    </button>
                  )}
                </div>

                {medicines.map((medicine, index) => (
                  <div className="row g-3 mb-3" key={index}>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Medicine Name"
                        value={medicine.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                        disabled={isCompleted}
                      />
                    </div>

                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dosage"
                        value={medicine.dosage}
                        onChange={(e) =>
                          handleMedicineChange(index, "dosage", e.target.value)
                        }
                        disabled={isCompleted}
                      />
                    </div>

                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Duration"
                        value={medicine.duration}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "duration",
                            e.target.value,
                          )
                        }
                        disabled={isCompleted}
                      />
                    </div>

                    <div className="col-md-2">
                      {isCompleted ? (
                        <></>
                      ) : (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="btn btn-outline-danger w-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TESTS */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold mb-0">
                    <i className="fas fa-vial text-danger me-2"></i>
                    Recommended Tests
                  </h5>

                  {!isCompleted && (
                    <button
                      onClick={addTest}
                      className="btn btn-sm btn-outline-primary rounded-pill"
                    >
                      + Add Test
                    </button>
                  )}
                </div>

                {tests.map((test, index) => (
                  <div className="d-flex gap-2 mb-3" key={index}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter test name"
                      value={test}
                      onChange={(e) => handleTestChange(index, e.target.value)}
                      disabled={isCompleted}
                    />

                    {!isCompleted && (
                      <button
                        onClick={() => removeTest(index)}
                        className="btn btn-outline-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* FOLLOW UP */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">
                  <i className="fas fa-calendar-check text-warning me-2"></i>
                  Follow Up
                </h5>

                {isCompleted ? (
                  <div className="p-3 bg-light rounded-3">
                    {followUpDate || "No follow up scheduled"}
                  </div>
                ) : (
                  <>
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <button
                        onClick={() => setFollowUp(3)}
                        className="btn btn-outline-secondary rounded-pill"
                      >
                        3 Days
                      </button>

                      <button
                        onClick={() => setFollowUp(7)}
                        className="btn btn-outline-primary rounded-pill"
                      >
                        Next Week
                      </button>

                      <button
                        onClick={() => setFollowUp(30)}
                        className="btn btn-outline-secondary rounded-pill"
                      >
                        Next Month
                      </button>
                    </div>

                    <input
                      type="date"
                      className="form-control"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-4">
            {/* HISTORY */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-4">
                  <i className="fas fa-history text-dark me-2"></i>
                  Previous History
                </h5>

                {history?.map((history, index) => (
                  <Link
                  to={`/appointment/${history._id}`}
                  className="text-decoration-none"
                  >
                    <div
                      key={index}
                      className="border rounded-4 p-3 mb-3 bg-light"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">{history?.slotDate}</h6>

                        <span className="badge bg-success-subtle text-success">
                          Completed
                        </span>
                      </div>

                      <small className="text-muted">
                        {history?.docData?.name} •{" "}
                        {history?.docData?.speciality}
                      </small>

                      <hr />

                      <div className="small">
                        <strong>Notes:</strong>

                        <p className="mb-2 text-muted">
                          {history?.doctorNotes?.notes}
                        </p>

                        {history?.doctorNotes?.medicines.length > 0 && (
                          <>
                            <strong>Medicines:</strong>

                            <ul className="mb-2">
                              {history?.doctorNotes?.medicines.map((med, i) => (
                                <li key={i}>{med.name}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        {history?.doctorNotes?.length > 0 && (
                          <>
                            <strong>Tests:</strong>

                            <ul className="mb-0">
                              {history.tests.map((test, i) => (
                                <li key={i}>{test.name}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConsultation;
