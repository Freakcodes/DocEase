import React, { use, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Appointments = () => {
  const{id}=useParams();
  const {doctors}=useContext(AppContext);
  const[doc,setDoc]=useState({});
  const findDoc=async()=>{
    const doctor= doctors.find(doc=>doc._id===id);
    setDoc(doctor);
    
    
  }
  useEffect(()=>{
    findDoc();
    console.log(doc.image);
    
  },[doc,id]);

  
  return  (


    <div className='container'>

      <div className="row">
      <div className='col-lg-3'  >
        <img src={doc.image} width={300} className='doctor-card-appointment '/>
      </div>

      <div className="col-lg-9 border rounded mt-4">
        <h2 className='mt-4'>{doc.name}</h2>
        <p className='text-secondary'>{doc.degree}-{doc.speciality} <span className=' ml-3 rounded-pill border p-1'>{doc.experience}</span></p>
        <p>About </p>
        <p>{doc.about}</p>
        <p>Appointment Fee: ₹{doc.fees}</p>
      </div>
    </div>
    </div>
  )
}

export default Appointments