import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faHeartPulse,
  faBrain,
  faTooth,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

const specialties = [
  { name: "General Physician", icon: faUserDoctor, color: "text-primary" },
  { name: "Cardiologist", icon: faHeartPulse, color: "text-danger" },
  { name: "Neurologist", icon: faBrain, color: "text-info" },
  { name: "Dentist", icon: faTooth, color: "text-warning" },
];

export default function SpecialtySection() {
  const navigate = useNavigate();
  return (
    <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <h2 className="text-center mb-4">Find by Specialty</h2>
        <div className="row g-4 text-center">
          {specialties.map((spec, index) => (
            <div  key={index} className="col-6 col-md-3">
              <div onClick={()=>{navigate(`/doctors/${spec.name.toLowerCase().replace(" ","-")}`);scrollTo(0,0)}} className="card specialty-card shadow-sm border-0 h-100 no-underline">
                <div className="card-body">
                  <FontAwesomeIcon
                    icon={spec.icon}
                    className={`${spec.color} fa-2x mb-3`}
                  />
                  <h6 className="card-title">{spec.name}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
