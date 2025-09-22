import React, { use } from "react";
import { doctors } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
const DoctorsToBook = () => {
  const navigate=useNavigate();
  return (
    <div className="">
      <div className="row text-center mt-5 mb-5">
        <div className="col-lg-12">
          <h2>Top Doctors to Book</h2>
          <p>Simply browse through our extensive list of trusted doctors.</p>
        </div>
      </div>

      <div className="row  text-center">
        {doctors.slice(0, 8).map((doctors, index) => (
          <Link to={`appointments/${doctors._id}`} className="col-lg-3 col-12 mb-4 no-underline  " key={index}>
            <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
              <img
                src={doctors.image}
                alt="doc_img"
                width={200}
                className=" doctor-card rounded shadow-sm p-3 border-0 h-100"
              />
              <div>
                <p className="text-success ">Available</p>
                <p className="fw-semibold fs-5">{doctors.name}</p>
                <span className="text-secondary">{doctors.speciality}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="button d-flex justify-content-center my-2">
        <button onClick={()=>{navigate('/doctors');scrollTo(0,0)}} className="btn btn-dark rounded-pill px-4 py-2 underline">more</button>
      </div>
    </div>
  );
};

export default DoctorsToBook;
