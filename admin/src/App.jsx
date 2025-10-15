import { useContext, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import { AdminContext } from "./context/AdminContext";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import Appointments from "./pages/admin/Appointments";
import DoctorsList from "./pages/admin/DoctorsList";
import AddDoctor from "./pages/admin/AddDoctor";
import { DoctorContext } from "./context/DoctorContext";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
function App() {
  const { adminToken } = useContext(AdminContext);
  const { doctortoken } = useContext(DoctorContext);

  return adminToken || doctortoken ? (
    <div>
      <ToastContainer />
      <div className="">
        <Sidebar />
        {adminToken ? (
          <Routes className="">
            <Route path="/" element={<></>} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-appointments" element={<Appointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
          </Routes>
        ):
         <Routes className="">
            <Route path="/" element={<></>} />
            <Route path="/dashboard" element={<DoctorDashboard/>} />
            <Route path="/appointments" element={<DoctorAppointments/>} />
            <Route path="/profile" element={<DoctorProfile/>} />
          
          </Routes>
        }
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
}

export default App;
