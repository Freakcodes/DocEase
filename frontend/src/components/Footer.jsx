import React from "react";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <footer className="bg-light text-dark pt-5 pb-3 mt-5 border-top">
      <div className="container">
        <div className="row">
          
          {/* Left Column - Company Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="fw-bold text-primary">DocEase</h5>
            <p>
              DocEase makes it simple to book appointments with trusted doctors.
              Your health, our priority — anytime, anywhere.
            </p>
          </div>
          
          {/* Middle Column - Links */}
          <div className="col-lg-4 col-md-3 mb-4">
            <h6 className="fw-bold">COMPANY</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-dark text-decoration-none">Home</Link></li>
              <li><Link to="/about" className="text-dark text-decoration-none">About us</Link></li>
              <li><Link to="/services" className="text-dark text-decoration-none">Services</Link></li>
              <li><Link to="/privacy" className="text-dark text-decoration-none">Privacy Policy</Link></li>
            </ul>
          </div>
          
          {/* Right Column - Contact */}
          <div className="col-lg-4 col-md-3 mb-4">
            <h6 className="fw-bold">GET IN TOUCH</h6>
            <p className="mb-1">+91-9876543210</p>
            <p>support@docease.com</p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center pt-3 border-top">
          <p className="mb-0">
            © {new Date().getFullYear()} DocEase — All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
