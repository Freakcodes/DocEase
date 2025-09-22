import React from 'react'
import { Link, NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-light">
      <div className="container">
        <Link className="navbar-brand text-primary fw-bold" to="/">DocEase</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex justify-content-between">
            <li className="nav-item text-primary">
              <NavLink className="nav-link " to="/" end>Home</NavLink>
            </li>
            <li className="nav-item text-primary">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            <li className="nav-item text-primary">
              <NavLink className="nav-link" to="/contacts">Contact Us</NavLink>
            </li>
            <li className="nav-item text-primary">
              <NavLink className="nav-link" to="/doctors">All Doctors</NavLink>
            </li>
            <li className="nav-item text-primary">
              <NavLink className="nav-link" to="/appointments">My Appointments</NavLink>
            </li>
            
          </ul>
          <div>
            <NavLink className="btn btn-outline-light  btn-primary ms-3" to="/register">Create Account</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;