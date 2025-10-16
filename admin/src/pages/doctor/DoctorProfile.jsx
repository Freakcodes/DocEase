import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorProfile = () => {

  const {doctorData,getDoctorData,doctortoken}=useContext(DoctorContext);
  useEffect(()=>{
    if(doctortoken)getDoctorData();
  },[doctortoken])

  return (
    <div>DoctorProfile</div>
  )
}

export default DoctorProfile