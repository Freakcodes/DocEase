import axios from "axios";
import { createContext,useState } from "react";
export const AdminContext = createContext();
const AdminContextProvider = (props) => {
  const [adminToken,setAdminToken]=useState(localStorage.getItem('adminToken')?localStorage.getItem('adminToken'):'');
  const [doctor,setDoctor]=useState([]);
  const backendUrl=import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors=async()=>{
    const {data}=await axios.get(backendUrl+`/api/admin/all-doctors`);
    setDoctor(data.doctors);

  }
  const value = {
    adminToken,setAdminToken,backendUrl,getAllDoctors,doctor
  };
  return (
  <AdminContext.Provider value={value}>
    {props.children}
  </AdminContext.Provider>
  );
};

export default AdminContextProvider;
