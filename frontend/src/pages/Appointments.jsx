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

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // ✅ Find doctor
  const findDoc = () => {
    const doctor = doctors.find((doc) => doc._id === id);
    setDoc(doctor);
  };

  // ✅ Generate slots dynamically
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

      // ✅ skip unavailable days
      if (!doc?.availableDays?.includes(currentDay)) {
        setDocSlot((prev) => [...prev, []]);
        continue;
      }

      let startTime = new Date(currentDate);
      startTime.setHours(startHour, startMin, 0, 0);

      let endTime = new Date(currentDate);
      endTime.setHours(endHour, endMin, 0, 0);

      // ✅ FIX: overnight shift support
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      // ✅ avoid past time (today)
      if (i === 0) {
        let now = new Date();

        if (now > startTime) {
          startTime = new Date(now);

          const minutes = startTime.getMinutes();
          const remainder = minutes % doc.slotDuration;

          if (remainder !== 0) {
            startTime.setMinutes(
              minutes + (doc.slotDuration - remainder)
            );
          }
        }
      }

      let timeSlots = [];

      while (startTime < endTime) {
        let formattedTime = startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        let day = startTime.getDate();
        let month = startTime.getMonth() + 1;
        let year = startTime.getFullYear();

        const slotDate = `${day}-${month}-${year}`;

        const isSlotAvailable =
          doc.slots_booked?.[slotDate]?.includes(formattedTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(startTime),
            time: formattedTime,
          });
        }

        // ✅ dynamic slot interval
        startTime.setMinutes(startTime.getMinutes() + doc.slotDuration);
      }

      setDocSlot((prev) => [...prev, timeSlots]);
    }
  };

  // ✅ Book appointment
  const handleSubmit = async () => {
    if (!token) {
      toast.warn("please login first");
      return navigate("/login");
    }

    try {
      const selectedSlot = docSlot[slotIndex]?.find(
        (slot) => slot.time === slotTime
      );

      if (!selectedSlot) {
        return toast.error("Please select a time slot");
      }

      const date = selectedSlot.dateTime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}-${month}-${year}`;

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
      console.log(error);
      toast.error(error.message);
    }
  };

  // ✅ Effects
  useEffect(() => {
    findDoc();
  }, [doctors, id]);

  useEffect(() => {
    if (doc) {
      getAvailableSlots();
    }
  }, [doc]);

  return (
    doc && (
      <div className="container">
        <div className="row ">
          <div className="col-lg-3 ">
            <img
              src={doc.image}
              width={300}
              className="doctor-card-appointment "
              alt="doctor"
            />
          </div>

          <div className="col-lg-9 mt-4">
            <div className="border rounded-2">
              <h2 className="mt-4">{doc.name}</h2>
              <p className="text-secondary">
                {doc.degree}-{doc.speciality}
                <span className="ml-3 rounded-pill border p-1">
                  {doc.experience}
                </span>
              </p>
              <p>About</p>
              <p>{doc.about}</p>
              <p>
                Appointment Fee: {currencySymbol}
                {doc.fees}
              </p>
            </div>

            <div className="booking-slots mt-2">
              <p className="text-muted fw-bold">Booking Slots</p>
            </div>

            {/* ✅ Dates */}
            <div className="d-flex gap-4 overflow-x-auto hide-scrollbar">
              {docSlot.length > 0 &&
                docSlot.map(
                  (item, index) =>
                    item.length > 0 && (
                      <div
                        onClick={() => setDocSlotIndex(index)}
                        className={`rounded-pill pointer p-2 ${
                          slotIndex === index
                            ? "bg-primary text-white"
                            : ""
                        }`}
                        key={index}
                      >
                        <p>
                          {daysOfWeek[item[0].dateTime.getDay()]}
                        </p>
                        <p>{item[0].dateTime.getDate()}</p>
                      </div>
                    )
                )}
            </div>

            {/* ✅ Time Slots */}
            <div className="d-flex align-items-center w-full overflow-x-auto hide-scrollbar gap-3 mt-3">
              {docSlot.length > 0 &&
                docSlot[slotIndex]?.map((item, index) => (
                  <p
                    key={index}
                    onClick={() => setSlotTime(item.time)}
                    className={`pointer px-4 py-1 border rounded-3 text-nowrap ${
                      item.time === slotTime
                        ? "bg-primary text-white"
                        : ""
                    }`}
                  >
                    {item.time}
                  </p>
                ))}
            </div>

            <button className="btn btn-primary" onClick={handleSubmit}>
              Book an Appointment
            </button>
          </div>
        </div>

        <div className="related-rows">
          <div className="rows">
            <div className="col-lg-12">
              <h5 className="text-center mt-4">Related Doctors</h5>
              <p className="text-muted text-center">
                Simply browse through our extensive list of trusted doctors
              </p>
            </div>
          </div>

          <RelatedDoctors docId={doc._id} speciality={doc.speciality} />
        </div>
      </div>
    )
  );
};

export default Appointments;