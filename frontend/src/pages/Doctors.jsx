import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
const Doctors = () => {
  const navigate = useNavigate();
  const { speciality } = useParams();
  console.log(speciality);
  const { doctors } = useContext(AppContext);
  const[filterDoc,setFilterDoc]=useState([...doctors]);

  //make one function to apply filter

  const applyFilter=()=>{
    if(speciality){
      setFilterDoc(doctors.filter(doc=>doc.speciality.toLowerCase()===speciality.replace('-',' ')));
    }else{
      setFilterDoc([...doctors]);
    }
  }

  useEffect(()=>{
    applyFilter();
  },[speciality,doctors]);

  return (
    <div className="container">

    
    <div className="row mt-4 space-between ">
      {/* Sidebar */}
      <div className="sidebar col-lg-2 col-4 border-right ">
        <p onClick={()=>speciality==='general-physician'?navigate('/doctors'):navigate('/doctors/general-physician')} className={`${speciality==='general-physician'?'bg-color-white':''}`}>Genenral Physician</p>
        <p onClick={()=>speciality==='cardiologist'?navigate('/doctors'):navigate('/doctors/cardiologist')} className={`${speciality==='cardiologist'?'bg-color-white':''}`}>Cardiologist</p>
        <p onClick={()=>speciality==='neurologist'?navigate('/doctors'):navigate('/doctors/neurologist')} className={`${speciality==='neurologist'?'bg-color-white':''}`}>Neurologist</p>
        <p onClick={()=>speciality==='pediatrician'?navigate('/doctors'):navigate('/doctors/pediatrician')} className={`${speciality==='pediatrician'?'bg-color-white':''}`}>Pediatrician</p>
        <p onClick={()=>speciality==='dentist'?navigate('/doctors'):navigate('/doctors/dentist')} className={`${speciality==='dentist'?'bg-color-white':''}`}>Dentist</p>
      </div>
      <div className="main-content col-lg-9 col-8 ">
        <div className=" text-center row">
          {filterDoc.slice(0, 8).map((doctors, index) => (
            <Link
              to={`/appointments/${doctors._id}`}
              className="col-lg-4  mb-4 no-underline  "
              key={index}
            >
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
      </div>
    </div>
  </div>
  );
};

export default Doctors;
