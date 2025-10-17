import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { token, setToken, user } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-light">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand text-primary fw-bold" to="/">
          DocEase
        </Link>

        {/* Hamburger toggler (only visible on mobile) */}
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu"
          aria-controls="mobileMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Desktop Menu (hidden on mobile) */}
        <div className="collapse navbar-collapse d-none d-lg-flex" id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contacts">Contact Us</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/doctors">All Doctors</NavLink>
            </li>
          </ul>

          <div className="ms-3 position-relative">
            {token ? (
              <div className="position-relative">
                <img
                  src={user?.image}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", cursor: "pointer" }}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white shadow rounded py-2"
                    style={{ minWidth: "150px", zIndex: "100" }}
                  >
                    <Link
                      to="/myprofile"
                      className="dropdown-item px-3 py-2 text-dark text-decoration-none d-block"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/appointments"
                      className="dropdown-item px-3 py-2 text-dark text-decoration-none d-block"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      Appointments
                    </Link>
                    <hr className="my-1" />
                    <button
                      className="dropdown-item px-3 py-2 text-danger border-0 bg-transparent w-100 text-start"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink className="btn btn-outline-primary ms-3" to="/login">
                Create Account
              </NavLink>
            )}
          </div>
        </div>

        {/* Offcanvas Sidebar (Mobile Only) */}
        <div
          className="offcanvas offcanvas-start d-lg-none"
          tabIndex="-1"
          id="mobileMenu"
          aria-labelledby="mobileMenuLabel"
        >
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title text-primary fw-bold" id="mobileMenuLabel">
              DocEase
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body d-flex flex-column justify-content-between">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" data-bs-dismiss="offcanvas">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about" data-bs-dismiss="offcanvas">
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contacts" data-bs-dismiss="offcanvas">
                  Contact Us
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/doctors" data-bs-dismiss="offcanvas">
                  All Doctors
                </NavLink>
              </li>
            </ul>

            {/* Profile Section */}
            <div className="border-top pt-3">
              {token ? (
                <div className="text-center">
                  <img
                    src={user?.image}
                    alt="Profile"
                    className="rounded-circle mb-2"
                    style={{ width: "60px", height: "60px" }}
                  />
                  <p className="mb-1 fw-semibold">{user?.name}</p>
                  <Link
                    to="/myprofile"
                    className="btn btn-outline-primary btn-sm w-100 mb-2"
                    data-bs-dismiss="offcanvas"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/appointments"
                    className="btn btn-outline-secondary btn-sm w-100 mb-2"
                    data-bs-dismiss="offcanvas"
                  >
                    Appointments
                  </Link>
                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={handleLogout}
                    data-bs-dismiss="offcanvas"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink
                  className="btn btn-outline-primary w-100"
                  to="/login"
                  data-bs-dismiss="offcanvas"
                >
                  Create Account
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
