import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";


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
    setMenuOpen(false); // close sidebar on click
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-logo">
          DocEase
        </Link>

        {/* Desktop Menu */}
        <ul className={`nav-links ${menuOpen ? "open" : ""} my-auto` }>
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

          {/* Mobile Auth/Profile section */}
          <li className="mobile-auth">
            {token ? (
              <>
                <div className="profile-info">
                  <img src={user?.image} alt="Profile" />
                  <p>{user?.name}</p>
                </div>
                <button className="btn-outline" onClick={() => handleNavClick("/myprofile")}>
                  Profile
                </button>
                <button className="btn-outline" onClick={() => handleNavClick("/appointments")}>
                  Appointments
                </button>
                <button className="btn-danger" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className="btn-outline" onClick={() => handleNavClick("/login")}>
                Create Account
              </button>
            )}
          </li>
        </ul>

        {/* Right Section */}
        <div className="nav-actions">
          {token ? (
            <div className="profile-wrapper">
              <img
                src={user?.image}
                alt="Profile"
                className="profile-avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              />
              {showProfileMenu && (
                <div className="dropdown-menu">
                  <button onClick={() => handleNavClick("/myprofile")}>View Profile</button>
                  <button onClick={() => handleNavClick("/appointments")}>Appointments</button>
                  <hr />
                  <button className="text-danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-outline" onClick={() => handleNavClick("/login")}>
              Create Account
            </button>
          )}

          {/* Mobile menu icon */}
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`bar ${menuOpen ? "open" : ""}`}></div>
            <div className={`bar ${menuOpen ? "open" : ""}`}></div>
            <div className={`bar ${menuOpen ? "open" : ""}`}></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
