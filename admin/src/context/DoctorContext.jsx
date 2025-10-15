import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const [doctortoken, setDoctortoken] = useState(
    localStorage.getItem("doctortoken")
      ? localStorage.getItem("doctortoken")
      : null
  );
  const [appointments, setAppointments] = useState();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const getAppointments = async () => {
    try {
      const { data } =await axios.get(
        backendUrl + "/api/doctor/appointments",
        {headers:{doctortoken:doctortoken}}
      );
      if (data.success) {
        
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
      console.log(data);
    } catch (error) {
        toast.error(error.message);
    }
  };
  const value = {
    doctortoken,
    setDoctortoken,
    setAppointments,
    getAppointments,
    appointments,
    backendUrl
  };


  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
