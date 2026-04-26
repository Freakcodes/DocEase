import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorAppointments = () => {
  const { getAppointments, appointments, doctortoken, backendUrl } =
    useContext(DoctorContext);

  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", duration: "" },
  ]);
  const [tests, setTests] = useState([{ name: "" }]);
  const [nextAppointment, setNextAppointment] = useState("");
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const handleMark = async (appointment) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/mark-appointment",
        { appointmentId: appointment._id },
        { headers: { doctortoken: doctortoken } },
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
  const handleSubmit = async () => {
    // format date
    setSubmitting(true);
    const formatDate = (dateStr) => {
      if (!dateStr) return "";

      const [year, month, day] = dateStr.split("-");
      return `${parseInt(day)}-${parseInt(month)}-${year}`;
    };

    const formattedFollowUp = formatDate(nextAppointment);

    // clean data
    const cleanMedicines = medicines.filter((m) => m.name.trim() !== "");

    const cleanTests = tests.filter((t) => t.name.trim() !== "");

    // basic validation
    // if (!notes && cleanMedicines.length === 0 && cleanTests.length === 0) {
    //   toast.error("Please add at least notes, medicines, or tests");
    //   return;
    // }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        {
          appointmentId: selectedAppointment._id,
          notes,
          medicines: cleanMedicines,
          tests: cleanTests,
          followUpDate: formattedFollowUp,
        },
        {
          headers: { doctortoken },
        },
      );

      if (data.success) {
        toast.success(data.message);

        // reset UI
        setShowModal(false);
        setNotes("");
        setMedicines([{ name: "", dosage: "", duration: "" }]);
        setTests([{ name: "" }]);
        setNextAppointment("");
        setSelectedFollowUp(null);

        // refresh list
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }

    setSubmitting(false);
  };
  const handleQuickDate = (label, days) => {
    const today = new Date();
    today.setDate(today.getDate() + days);

    const formatted = today.toISOString().split("T")[0];

    setNextAppointment(formatted);
    setSelectedFollowUp(label);
  };
  useEffect(() => {
    const fetchData = async () => {
      if (doctortoken) {
        setLoading(true);
        await getAppointments();
        setLoading(false);
      }
    };
    fetchData();
  }, [doctortoken]);

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setFilteredAppointments(appointments.filter((apt) => !apt.cancelled));
    }
  }, [appointments]);

  const getAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    return new Date().getFullYear() - birth.getFullYear();
  };

  // Shimmer for table rows
  const ShimmerRow = () => (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i}>
          <div
            className="shimmer-line"
            style={{ height: "20px", width: "100%", borderRadius: "4px" }}
          ></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="margin-left-side mt-4 px-3">
      <h4 className="fw-semibold mb-4">Todays Appointments</h4>

      <div className="table-responsive bg-white shadow-sm rounded-4 p-3">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Age</th>
              <th>Date & Time</th>
              <th>Fees</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <ShimmerRow key={index} />
              ))
            ) : filteredAppointments && filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt, index) => {
                const user = apt.userData;
                const doc = apt.docData;

                return (
                  !apt.cancelled && (
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
                      <td className="py-3">{getAge(user?.dob)}</td>
                      <td className="py-3 text-muted">
                        {apt.slotDate}, {apt.slotTime}
                      </td>
                      <td className="py-3 text-dark fw-semibold">
                        ${doc?.fees || 0}
                      </td>
                      <td className="py-3 text-center">
                        {apt.isCompleted ? (
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                            <i className="fas fa-check-circle me-1"></i>
                            Completed
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-success rounded-circle d-flex align-items-center justify-content-center mx-auto"
                            style={{ width: "32px", height: "32px" }}
                            title="Mark as Completed"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowModal(true);
                            }}
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
                  colSpan="6"
                  className="text-center text-muted py-5 fs-6 fw-medium"
                >
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">Add Prescription</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                {/* Notes */}
                <div className="mb-4">
                  <label className="form-label fw-medium">Doctor Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Medicines */}
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <h6 className="fw-semibold mb-0">Medicines</h6>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      setMedicines([
                        ...medicines,
                        { name: "", dosage: "", duration: "" },
                      ])
                    }
                  >
                    + Add
                  </button>
                </div>

                {medicines.map((med, index) => (
                  <div className="row g-2 mb-3" key={index}>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Medicine Name"
                        value={med.name}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[index].name = e.target.value;
                          setMedicines(updated);
                        }}
                      />
                    </div>

                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[index].dosage = e.target.value;
                          setMedicines(updated);
                        }}
                      />
                    </div>

                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[index].duration = e.target.value;
                          setMedicines(updated);
                        }}
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="col-md-2 d-flex align-items-center">
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => {
                          const updated = medicines.filter(
                            (_, i) => i !== index,
                          );
                          setMedicines(updated);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {/* Tests */}
                {/* Tests */}
                <div className="mt-4">
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <h6 className="fw-semibold mb-0">Tests</h6>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setTests([...tests, { name: "" }])}
                    >
                      + Add
                    </button>
                  </div>

                  {tests.map((test, index) => (
                    <div className="row g-2 mb-2" key={index}>
                      <div className="col-md-10">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Test Name (e.g. Blood Test, X-Ray)"
                          value={test.name}
                          onChange={(e) => {
                            const updated = [...tests];
                            updated[index].name = e.target.value;
                            setTests(updated);
                          }}
                        />
                      </div>

                      <div className="col-md-2 d-flex align-items-center">
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={() => {
                            const updated = tests.filter((_, i) => i !== index);
                            setTests(updated);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Follow Up Date */}
                <div className="mt-4">
                  <label className="form-label fw-medium">Follow-up</label>

                  {/* Quick Options */}
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill ${
                        selectedFollowUp === "3days"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleQuickDate("3days", 3)}
                    >
                      3 Days
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill ${
                        selectedFollowUp === "week"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleQuickDate("week", 7)}
                    >
                      Next Week
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill ${
                        selectedFollowUp === "month"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleQuickDate("month", 30)}
                    >
                      Next Month
                    </button>
                  </div>

                  {/* Date Picker */}
                  <input
                    type="date"
                    className="form-control"
                    value={nextAppointment}
                    onChange={(e) => {
                      setNextAppointment(e.target.value);
                      setSelectedFollowUp(null); // reset selection
                    }}
                  />

                  {/* Preview */}
                  {nextAppointment && (
                    <small className="text-muted mt-1 d-block">
                      Follow-up on{" "}
                      {new Date(nextAppointment).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </small>
                  )}
                </div>
              </div>
              {/* Follow Up Date */}

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Complete & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
