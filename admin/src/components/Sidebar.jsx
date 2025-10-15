import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { adminToken, setAdminToken } = useContext(AdminContext);
  const {doctortoken,setDoctorToken}=useContext(DoctorContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    
    if(adminToken){
      adminToken && setAdminToken("");
      adminToken && localStorage.removeItem("adminToken");
    }else{
      doctortoken && setDoctorToken("");
      doctortoken && localStorage.removeItem("doctortoken")
    }
   
    navigate("/");
  };
  const toggleSidebar = () => setIsOpen(!isOpen);


  return (
    <>
      {/* Toggle Button for Mobile */}
   
        <div className="sidebar-nav ml-2">
          <div className="fw-bold fs-3 my-3 ">Doc<span className="text-primary">Ease</span></div>
          <div>
            <button className="menu-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
   

      {/* Sidebar */}

      {
        adminToken &&
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <ul className="sidebar-links">
          <li>
            <Link
              to="/admin-dashboard"
              className={
                location.pathname === "/admin-dashboard" ? "active" : ""
              }
            >
              <i className="fas fa-home"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/all-appointments"
              className={
                location.pathname === "/all-appointments" ? "active" : ""
              }
            >
              <i className="fas fa-calendar-alt"></i> Appointments
            </Link>
          </li>
          <li>
            <Link
              to="/add-doctor"
              className={location.pathname === "/add-doctor" ? "active" : ""}
            >
              <i className="fas fa-user-plus"></i> Add Doctor
            </Link>
          </li>
          <li>
            <Link
              to="/doctor-list"
              className={location.pathname === "/doctor-list" ? "active" : ""}
            >
              <i className="fas fa-user-md"></i> Doctors List
            </Link>
          </li>
          <li className="text-center ">
            <button
              onClick={handleLogout}
              className="btn btn-primary ms-auto w-100"
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>
      }

      {doctortoken &&
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Doctor Panel</h2>
          <button className="close-btn" onClick={toggleSidebar}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <ul className="sidebar-links">
          <li>
            <Link
              to="/dashboard"
              className={
                location.pathname === "/dashboard" ? "active" : ""
              }
            >
              <i className="fas fa-home"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/appointments"
              className={
                location.pathname === "/appointments" ? "active" : ""
              }
            >
              <i className="fas fa-calendar-alt"></i> Appointments
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={
                location.pathname === "/profile" ? "active" : ""
              }
            >
              <i className="fas fa-user"></i> Profile
            </Link>
          </li>
          
          <li className="text-center ">
            <button
              onClick={handleLogout}
              className="btn btn-primary ms-auto w-100"
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>
    
}
      {/* Overlay for mobile */}
      {isOpen && <div onClick={toggleSidebar} className="overlay"></div>}
    </>
  );
};

export default Sidebar;
