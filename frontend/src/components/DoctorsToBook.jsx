import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const DoctorsToBook = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const isLoading = !doctors || doctors.length === 0; // simple loading check

//Shimmer for 8 Cards..  
  const shimmerCards = Array.from({ length: 8 }).map((_, index) => (
    <div
      className="col-lg-3 col-12 mb-4"
      key={index}
    >
      <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
        <div className="shimmer-img rounded mb-3"></div>
        <div className="shimmer-line w-75 mb-2"></div>
        <div className="shimmer-line w-50"></div>
      </div>
    </div>
  ));

  return (
    <div>
      <div className="row text-center mt-5 mb-5">
        <div className="col-lg-12">
          <h2>Top Doctors to Book</h2>
          <p>Simply browse through our extensive list of trusted doctors.</p>
        </div>
      </div>

      <div className="row text-center">
        {isLoading
          ? shimmerCards
          : doctors.slice(0, 8).map((doctor, index) => (
              <Link
                to={`appointments/${doctor._id}`}
                className="col-lg-3 col-12 mb-4 no-underline"
                key={index}
              >
                <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
                  <img
                    src={doctor.image}
                    alt="doc_img"
                    width={200}
                    className="doctor-card rounded shadow-sm p-3 border-0 h-100"
                  />
                  <div>
                    <p className="text-success">Available</p>
                    <p className="fw-semibold fs-5">{doctor.name}</p>
                    <span className="text-secondary">{doctor.speciality}</span>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      <div className="button d-flex justify-content-center my-2">
        <button
          onClick={() => {
            navigate("/doctors");
            scrollTo(0, 0);
          }}
          className="btn btn-dark rounded-pill px-4 py-2 underline"
        >
          more
        </button>
      </div>
    </div>
  );
};

export default DoctorsToBook;
