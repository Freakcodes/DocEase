import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button for Mobile */}
      {
        !isOpen?(<button className="menu-btn" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>):(
        <>
        </>
      )
      
      }
      

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
              className={location.pathname === "/admin-dashboard" ? "active" : ""}
            >
              <i className="fas fa-home"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/all-appointments"
              className={location.pathname === "/all-appointments" ? "active" : ""}
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
          <li>
            <Link
              to="/settings"
              className={location.pathname === "/settings" ? "active" : ""}
            >
              <i className="fas fa-cog"></i> Settings
            </Link>
          </li>
        </ul>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
