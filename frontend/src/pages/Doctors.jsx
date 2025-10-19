import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Shimmer from "../components/Shimmer";
const Doctors = () => {
  const navigate = useNavigate();
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([...doctors]);
  const [showFilters, setShowFilters] = useState(false);
  const isLoading=!doctors || doctors.length===0;
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(
        doctors.filter(
          (doc) =>
            doc.speciality.toLowerCase() === speciality.replace("-", " ")
        )
      );
    } else {
      setFilterDoc([...doctors]);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, doctors]);

  const handleFilterClick = (spec) => {
    if (speciality === spec) navigate("/doctors");
    else navigate(`/doctors/${spec}`);
    setShowFilters(false);
  };

  const specialities = [
    "general-physician",
    "cardiologist",
    "neurologist",
    "pediatrician",
    "dentist",
  ];
  
  return (
    <div className="container py-4">
      {/* Filter Toggle Button (visible on mobile) */}
      <div className="d-flex d-lg-none justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-primary m-0">Find Doctors</h5>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="row">
        {/* Sidebar - visible on lg and above */}
        <div className="col-lg-3 d-none d-lg-block border-end">
          <h6 className="fw-semibold mb-3">Specialities</h6>
          {specialities.map((spec) => (
            <p
              key={spec}
              onClick={() => handleFilterClick(spec)}
              className={`p-2 mb-2 rounded text-capitalize ${
                speciality === spec
                  ? "bg-primary text-white"
                  : "bg-light text-dark"
              }`}
              style={{ cursor: "pointer" }}
            >
              {spec.replace("-", " ")}
            </p>
          ))}
        </div>

        {/* Mobile Filters (collapsible dropdown style) */}
        {showFilters && (
          <div className="col-12 mb-3 d-lg-none">
            <div className="d-flex flex-wrap gap-2">
              {specialities.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleFilterClick(spec)}
                  className={`btn btn-sm ${
                    speciality === spec
                      ? "btn-primary text-white"
                      : "btn-outline-primary"
                  }`}
                >
                  {spec.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="col-lg-9">
          <div className="row g-3">
            {
            
            isLoading ?<Shimmer length={3}/>:

            filterDoc.length > 0 ? (
              filterDoc.slice(0, 8).map((doc, index) => (
                <div
                  className="col-12 col-sm-6 col-md-4"
                  key={index}
                  style={{ cursor: "pointer" }}
                >
                  <Link
                    to={`/appointments/${doc._id}`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 text-center hover-shadow-sm">
                      <img
                        src={doc.image}
                        alt="doctor"
                        className="rounded-circle mb-3"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                      <p className="text-success small mb-1">Available</p>
                      <h6 className="fw-semibold mb-0">{doc.name}</h6>
                      <p className="text-secondary small mb-0">
                        {doc.speciality}
                      </p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center text-muted mt-4">
                No doctors found for this speciality.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
