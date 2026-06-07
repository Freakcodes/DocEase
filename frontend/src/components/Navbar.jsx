import React, { useContext, useRef, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Navbar = () => {
  const { token, setToken, user } = useContext(AppContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { to: "/",            label: "Home" },
    { to: "/doctors",     label: "Doctors" },
    { to: "/ai-report",   label: "AI Report" },
    { to: "/about",       label: "About" },
    { to: "/contacts",    label: "Contact" },
  ];

  const linkClass = ({ isActive }) =>
    `nav-link px-2 fw-medium ${isActive ? "text-primary" : "text-dark"}`;

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top">
      <div className="container" style={{ maxWidth: "1100px" }}>

        {/* ── Brand ─────────────────────────────────────────────── */}
        <Link
          to="/"
          className="navbar-brand fw-bold text-primary fs-4 me-4"
          style={{ letterSpacing: "1px" }}
        >
          DocEase
        </Link>

        {/* ── Mobile toggler ────────────────────────────────────── */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ── Collapsible content ───────────────────────────────── */}
        <div className="collapse navbar-collapse" id="mainNav">

          {/* Nav links */}
          <ul className="navbar-nav mx-auto gap-1">
            {navLinks.map(({ to, label }) => (
              <li className="nav-item" key={to}>
                <NavLink to={to} className={linkClass} end={to === "/"}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Right section ── */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {token ? (
              <div className="position-relative" ref={dropdownRef}>
                {/* Avatar trigger */}
                <button
                  className="btn d-flex align-items-center gap-2 rounded-3 border px-3 py-2 bg-white"
                  onClick={() => setShowDropdown((p) => !p)}
                >
                  <img
                    src={user?.image || assets.profile_pic}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: "30px", height: "30px", objectFit: "cover" }}
                  />
                  <span className="fw-semibold small text-dark d-none d-sm-inline">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <i className={`bi bi-chevron-${showDropdown ? "up" : "down"} small text-muted`}></i>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border rounded-4 shadow-lg py-2"
                    style={{ minWidth: "200px", zIndex: 1000 }}
                  >
                    {/* User info */}
                    <div className="px-3 py-2 border-bottom mb-1">
                      <p className="fw-bold mb-0 small">{user?.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: "11px" }}>{user?.email}</p>
                    </div>

                    <button
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 small"
                      onClick={() => { navigate("/myprofile"); setShowDropdown(false); }}
                    >
                      <i className="bi bi-person text-primary"></i> My Profile
                    </button>

                    <button
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 small"
                      onClick={() => { navigate("/appointments"); setShowDropdown(false); }}
                    >
                      <i className="bi bi-calendar2-check text-primary"></i> My Appointments
                    </button>

                    <hr className="my-1" />

                    <button
                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 small text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-primary rounded-3 px-4 fw-semibold"
                onClick={() => navigate("/login")}
              >
                <i className="bi bi-person me-2"></i>Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
