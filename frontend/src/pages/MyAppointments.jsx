import React, { useContext,useEffect,useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppointments = () => {
  const { token,backEndUrl} = useContext(AppContext);
  const [appointments,setAppointments]=useState();
  const getAppointedDoctors=async()=>{
    const {data}=await axios.get(backEndUrl+'/api/user/list-appointments',{headers:{usertoken:token}});
    if(data.success){
     
      setAppointments(data.appointments);
      
    }else{
      toast.error(data.message);
    }
    
  }

  useEffect(()=>{
    getAppointedDoctors();
  },[token])

 
  return (
    <div className="container py-5">
      <h3 className="mb-4 text-primary">My Appointments</h3>
      <div className="row">
        {appointments && appointments.map((appointments, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={appointments.docData.image}
                alt="doc-img"
                className="card-img-top"
                style={{ height: '200px', objectFit: 'contain' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{appointments.docData.name}</h5>
                <p className="text-muted mb-2">{appointments.docData.speciality}</p>
                <div className="mb-3">
                  <p className="mb-1 fw-bold">Address:</p>
                  <p className="mb-0">{appointments.docData.address.line1}</p>
                  <p className="mb-0">{appointments.docData.address.line2}</p>
                </div>
                <div className="my-2">
                  <span className=''>{appointments.slotDate}     </span>
                  <span>{appointments.slotTime}</span>
                  
                </div>
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-primary flex-fill">Pay Online</button>
                  <button className="btn btn-outline-danger flex-fill">Cancel Appointment</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
