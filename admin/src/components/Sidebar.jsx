import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { AdminContext } from "../context/AdminContext";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { adminToken, setAdminToken } = useContext(AdminContext);

  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/");
    adminToken && setAdminToken("");
    adminToken && localStorage.removeItem("adminToken");
  };
  const toggleSidebar = () => setIsOpen(!isOpen);


  return (
    <>
      {/* Toggle Button for Mobile */}
   
        <div className="sidebar-nav">
          <div>DocEase</div>
          <div>
            <button className="menu-btn" onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
   

      {/* Sidebar */}
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

      {/* Overlay for mobile */}
      {isOpen && <div onClick={toggleSidebar} className="overlay"></div>}
    </>
  );
};

export default Sidebar;
