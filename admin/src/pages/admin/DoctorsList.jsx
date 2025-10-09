import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { Link } from "react-router-dom";
const doctorList = () => {
  const { getAllDoctors, doctor,adminToken } = useContext(AdminContext);
  useEffect(() => {
    getAllDoctors();
  }, []);
  return (

    

    
    <div className="margin-left-side">
      <h2 className="fs-4 mt-3 font-semibold">doctorList</h2>
      <div className="row  text-center">
      {doctor &&(
        doctor.slice(0, 8).map((doctor, index) => (
          <Link
            to={`appointments/${doctor._id}`}
            className="col-lg-3 col-12 mb-4 no-underline  "
            key={index}
          >
            <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
              <img
                src={doctor.image}
                alt="doc_img"
                width={200}
                className=" doctor-card rounded shadow-sm p-3 border-0 h-100"
              />
              <div>
                <p className="text-success ">Available</p>
                <p className="fw-semibold fs-5">{doctor.name}</p>
                <span className="text-secondary">{doctor.speciality}</span>
              </div>
            </div>
          </Link>
        )))}
      </div>
    </div>
    
  );
};

export default doctorList;
