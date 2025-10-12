import React, { use, useContext, useEffect, useState } from "react";
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
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [slotIndex, setDocSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [docSlot, setDocSlot] = useState([]);
  const findDoc = () => {
    const doctor = doctors.find((doc) => doc._id === id);
    setDoc(doctor);
  };

  const getAvailableSlots = async () => {
    setDocSlot([]);
    let today = new Date();
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      let endTime = new Date(today);

      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }
      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        // This block of code is for the slotime booking, suppose the slot time is not available so it won't be showed to the user
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "-" + month + "-" + year;
        const slotTime = formattedTime;
        const isSlotAvailable =
          doc.slots_booked[slotDate] &&
          doc.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;
        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlot((prev) => [...prev, timeSlots]);
    }
  };
  const handleSubmit = async () => {
    if (!token) {
      toast.warn("please login first");
      return navigate("/login");
    }

    try {
      const date = docSlot[slotIndex][0].dateTime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "-" + month + "-" + year;

      // console.log(dateTime);
      console.log(slotTime.time);
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

      console.log(data);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    findDoc();
  }, [doctors, id]);

  useEffect(() => {
    getAvailableSlots();
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
            />
          </div>

          <div className="col-lg-9   mt-4">
            <div className=" border rounded-2  ">
              <h2 className="mt-4">{doc.name}</h2>
              <p className="text-secondary ">
                {doc.degree}-{doc.speciality}{" "}
                <span className=" ml-3 rounded-pill border p-1">
                  {doc.experience}
                </span>
              </p>
              <p>About </p>
              <p>{doc.about}</p>
              <p>
                Appointment Fee: {currencySymbol}
                {doc.fees}
              </p>
            </div>

            <div className="booking-slots mt-2">
              <p className="text-muted fw-bold">Booking Slots</p>
            </div>

            <div className="d-flex gap-4 overflow-x-auto hide-scrollbar ">
              {docSlot.length &&
                docSlot.map(
                  (item, index) =>
                    item.length > 0 && (
                      <div
                        onClick={() => setDocSlotIndex(index)}
                        className={`  rounded-pill pointer p-2 ${
                          slotIndex === index ? "bg-primary text-white " : ""
                        }`}
                        key={index}
                      >
                        <p>{daysOfWeek[item[0].dateTime.getDay()]}</p>
                        <p>{item[0].dateTime.getDate()}</p>
                      </div>
                    )
                )}
            </div>

            <div className=" d-flex align-items-center w-full overflow-x-auto hide-scrollbar gap-3 mt-3">
              {docSlot.length &&
                docSlot[slotIndex].map((item, index) => (
                  <p
                    key={index}
                    onClick={() => setSlotTime(item.time)}
                    className={` pointer px-4 py-1 border rounded-3 text-nowrap ${
                      item.time === slotTime ? "bg-primary text-white" : ""
                    }`}
                  >
                    {item.time.trim()}
                  </p>
                ))}
            </div>
            <button class="btn btn-primary" onClick={handleSubmit}>
              Book an Appointment
            </button>
          </div>
        </div>
        <div className="related-rows">
          <div className="rows">
            <div className="col-lg-12">
              <h5 className=" text-center mt-4">Related Doctors</h5>
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
