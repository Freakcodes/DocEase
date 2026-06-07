import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointments = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { doctors, currencySymbol, token, backEndUrl, getDoctorsData } =
    useContext(AppContext);

  const [doc, setDoc] = useState();
  const [slotIndex, setDocSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [docSlot, setDocSlot] = useState([]);
  const [booking, setBooking] = useState(false);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const findDoc = () => {
    const doctor = doctors.find((doc) => doc._id === id);
    setDoc(doctor);
  };

  const getAvailableSlots = () => {
    if (!doc?.timings) return;
    setDocSlot([]);

    let today = new Date();
    const [startHour, startMin] = doc.timings.start.split(":").map(Number);
    const [endHour, endMin] = doc.timings.end.split(":").map(Number);

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const currentDay = daysOfWeek[currentDate.getDay()];
      if (!doc?.availableDays?.includes(currentDay)) {
        setDocSlot((prev) => [...prev, []]);
        continue;
      }

      let startTime = new Date(currentDate);
      startTime.setHours(startHour, startMin, 0, 0);

      let endTime = new Date(currentDate);
      endTime.setHours(endHour, endMin, 0, 0);

      if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

      if (i === 0) {
        let now = new Date();
        if (now > startTime) {
          startTime = new Date(now);
          const minutes = startTime.getMinutes();
          const remainder = minutes % doc.slotDuration;
          if (remainder !== 0)
            startTime.setMinutes(minutes + (doc.slotDuration - remainder));
        }
      }

      let timeSlots = [];
      while (startTime < endTime) {
        let formattedTime = startTime.toLocaleTimeString([], {
          hour: "2-digit", minute: "2-digit", hour12: true,
        });
        let day = startTime.getDate();
        let month = startTime.getMonth() + 1;
        let year = startTime.getFullYear();
        const slotDate = `${day}-${month}-${year}`;
        const isSlotAvailable = !doc.slots_booked?.[slotDate]?.includes(formattedTime);
        if (isSlotAvailable) timeSlots.push({ dateTime: new Date(startTime), time: formattedTime });
        startTime.setMinutes(startTime.getMinutes() + doc.slotDuration);
      }

      setDocSlot((prev) => [...prev, timeSlots]);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.warn("Please login first");
      return navigate("/login");
    }
    try {
      setBooking(true);
      const selectedSlot = docSlot[slotIndex]?.find((slot) => slot.time === slotTime);
      if (!selectedSlot) return toast.error("Please select a time slot");

      const date = selectedSlot.dateTime;
      const slotDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

      const { data } = await axios.post(
        backEndUrl + "/api/user/book-appointment",
        { docId: id, slotDate, slotTime },
        { headers: { usertoken: token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => { findDoc(); }, [doctors, id]);
  useEffect(() => { if (doc) getAvailableSlots(); }, [doc]);

  if (!doc) return null;

  const availableDays = docSlot.filter((s) => s.length > 0);

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1170px" }}>

        {/* ── Doctor Profile Card ───────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="bg-primary" style={{ height: "4px" }}></div>
          <div className="card-body p-4">
            <div className="row g-4 align-items-start">

              {/* Photo */}
              <div className="col-12 col-md-auto text-center">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="rounded-4 shadow-sm"
                  style={{ width: "180px", height: "200px", objectFit: "cover" }}
                />
              </div>

              {/* Info */}
              <div className="col">
                {/* Name + verified */}
                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <h4 className="fw-bold mb-0">{doc.name}</h4>
                  <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1 small">
                    <i className="bi bi-patch-check-fill me-1"></i>Verified
                  </span>
                </div>

                {/* Degree + Speciality + Experience */}
                <p className="text-muted mb-2">
                  {doc.degree} &mdash; {doc.speciality}
                  <span className="badge bg-light text-dark border ms-2 fw-normal">
                    {doc.experience}
                  </span>
                </p>

                {/* About */}
                <div className="mb-3">
                  <p className="small fw-bold text-uppercase text-muted mb-1 ls-1">
                    About
                  </p>
                  <p className="text-secondary small mb-0" style={{ lineHeight: "1.7" }}>
                    {doc.about}
                  </p>
                </div>

                {/* Fee */}
                <div className="d-inline-flex align-items-center gap-2 rounded-3 bg-primary bg-opacity-10 px-3 py-2">
                  
                  <span className="fw-bold text-primary">
                    Appointment Fee:<i className="bi bi-currency-rupee text-primary"></i>{doc.fees}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Booking Card ──────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 mb-5">
          <div className="card-body p-4">
            <h6 className="fw-bold text-uppercase text-muted small mb-4">
              <i className="bi bi-calendar2-check me-2 text-primary"></i>Select Booking Slot
            </h6>

            {availableDays.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                No available slots for the next 7 days
              </div>
            ) : (
              <>
                {/* ── Day Picker ── */}
                <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
                  {docSlot.map((item, index) =>
                    item.length > 0 ? (
                      <button
                        key={index}
                        onClick={() => { setDocSlotIndex(index); setSlotTime(""); }}
                        className={`btn flex-shrink-0 rounded-3 px-3 py-2 border ${
                          slotIndex === index
                            ? "btn-primary"
                            : "btn-white bg-white text-dark"
                        }`}
                        style={{ minWidth: "64px" }}
                      >
                        <div className="small fw-bold">
                          {daysOfWeek[item[0].dateTime.getDay()]}
                        </div>
                        <div className="fs-5 fw-bold lh-1 mt-1">
                          {item[0].dateTime.getDate()}
                        </div>
                      </button>
                    ) : null
                  )}
                </div>

                {/* ── Time Slots ── */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {docSlot[slotIndex]?.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSlotTime(item.time)}
                      className={`btn btn-sm rounded-pill px-3 py-1 border ${
                        item.time === slotTime
                          ? "btn-primary"
                          : "btn-white bg-white text-dark"
                      }`}
                    >
                      {item.time}
                    </button>
                  ))}
                </div>

                {/* ── Confirm Button ── */}
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <button
                    className="btn btn-primary px-5 py-2 fw-semibold rounded-3"
                    onClick={handleSubmit}
                    disabled={booking || !slotTime}
                  >
                    {booking ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Booking...</>
                    ) : (
                      <><i className="bi bi-calendar-plus me-2"></i>Book Appointment</>
                    )}
                  </button>
                  {!slotTime && (
                    <span className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>Please select a time slot
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Related Doctors ───────────────────────────────────── */}
        <div className="text-center mb-3">
          <h5 className="fw-bold">Related Doctors</h5>
          <p className="text-muted small">Browse through our extensive list of trusted doctors</p>
        </div>
        <RelatedDoctors docId={doc._id} speciality={doc.speciality} />

      </div>
    </div>
  );
};

export default Appointments;
