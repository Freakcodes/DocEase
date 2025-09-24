import React from "react";
import { assets } from "../assets/assets";
import {
  faUserMd,
  faClock,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const About = () => {
  return (
    <section className="container py-5">
      <div className="row align-items-center  ">
        {/* Image Section (You can replace with your image later) */}
        <div className="col-md-3 mb-4 mb-md-0 ">
          <img src={assets.about_image} alt="about" width={300} />
        </div>

        {/* Text Section */}
        <div className="col-md-8">
          <h2 className="fw-bold mb-3">
            About <span className="text-primary">DocEase</span>
          </h2>
          <p className="text-muted">
            DocEase is a modern doctor appointment booking platform designed to
            make healthcare access simple and convenient. With DocEase, patients
            can browse doctors, view availability, and schedule appointments
            seamlessly from the comfort of their homes.
          </p>
          <p className="text-muted">
            Our mission is to bridge the gap between patients and healthcare
            providers by offering a fast, reliable, and user-friendly
            experience. Whether you need a routine check-up or a specialist
            consultation, DocEase ensures hassle-free appointment management.
          </p>
          
        </div>
      </div>
      <section className="container py-5">
        <h2 className="fw-bold mb-4 text-center">
          Why <span className="text-primary">Choose </span>Us
        </h2>
        <div className="row text-center">
          {/* Card 1 */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faUserMd}
                  size="3x"
                  className="text-primary mb-3"
                />
                <h5 className="card-title fw-bold">Qualified Doctors</h5>
                <p className="card-text text-muted">
                  Access a network of certified and experienced medical
                  professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faClock}
                  size="3x"
                  className="text-primary mb-3"
                />
                <h5 className="card-title fw-bold">24/7 Availability</h5>
                <p className="card-text text-muted">
                  Book appointments anytime and manage your healthcare schedule
                  conveniently.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faMobileAlt}
                  size="3x"
                  className="text-primary mb-3"
                />
                <h5 className="card-title fw-bold">User-Friendly Platform</h5>
                <p className="card-text text-muted">
                  Easy to navigate interface to book, reschedule, and track
                  appointments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default About;
