import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

import { assets } from "../assets/assets";

const Navbar = () => {
  const { token, setToken, user } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-logo">
          DocEase
        </Link>

        {/* Menu Links */}
        <ul className={`nav-links ${menuOpen ? "open" : ""} my-auto`}>
          <li>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          </li>
          <li>
            <NavLink to="/contacts" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          </li>
          <li>
            <NavLink to="/doctors" onClick={() => setMenuOpen(false)}>Doctors</NavLink>
          </li>

          {/* Mobile Auth/Profile */}
          <li className="mobile-auth">
            {token ? (
              <>
                <div className="profile-info">
                  <img src={user?.image} alt="Profile" />
                  <p>{user?.name}</p>
                </div>
                <button className="btn-outline" onClick={() => handleNavClick("/myprofile")}>
                  <i className="fa fa-user me-2"></i> Profile
                </button>
                <button className="btn-outline" onClick={() => handleNavClick("/appointments")}>
                  <i className="fa fa-calendar me-2"></i> Appointments
                </button>
                <button className="btn-danger" onClick={handleLogout}>
                  <i className="fa fa-sign-out me-2"></i> Logout
                </button>
              </>
            ) : (
              <button className="btn-outline" onClick={() => handleNavClick("/login")}>
                <i className="fa fa-user-plus me-2"></i> Create Account
              </button>
            )}
          </li>
        </ul>

        {/* Right Section */}
        <div className="nav-actions">
          {token ? (
            <div
              className={`profile-wrapper ${showProfileMenu ? "active" : ""}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)} // only works on mobile
            >
              <img src={user?user.image:assets.profile_pic} alt="Profile" className="profile-avatar" />

              <div className="dropdown-menu">
                <button onClick={() => handleNavClick("/myprofile")}>
                  <i className="fa fa-user me-2"></i> View Profile
                </button>
                <button onClick={() => handleNavClick("/appointments")}>
                  <i className="fa fa-calendar me-2"></i> Appointments
                </button>
                <hr />
                <button className="text-danger" onClick={handleLogout}>
                  <i className="fa fa-sign-out me-2"></i> Logout
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-outline" onClick={() => handleNavClick("/login")}>
              <i className="fa fa-user-plus me-2"></i> Create Account
            </button>
          )}

          {/* Mobile menu icon */}
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fa fa-bars"></i>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
