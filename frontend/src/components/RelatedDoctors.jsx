import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { Link, useParams } from 'react-router-dom';

const RelatedDoctors = ({docId,speciality}) => {
    const {doctors}=useContext(AppContext);
    const [filteredDocs,setFilteredDocs]=useState([]);
    const {id}=useParams();
    const filterDocs=()=>{
        const filter=doctors.filter((doc)=>(doc.speciality===speciality && doc._id!=id));
        setFilteredDocs(filter);
    }

    useEffect(()=>{
        filterDocs();
    },[speciality,id])


  return (
    <div className='rows'>
        {
            filteredDocs.length >0 && 
            <div className=" text-center row">
          {filteredDocs.slice(0, 5).map((doctors, index) => (
            <Link
              to={`/appointments/${doctors._id}`}
              className="col-lg-4  mb-4 no-underline  "
              key={index}
            >
              <div className=" doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
              <img
            src={doctors.image}
            width={300}
            className="doctor-card-appointment "
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
        }
        
    </div>
  )
}

export default RelatedDoctors