import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const CTASection = () => {
  return (
     <div className=" my-5" mt-3>
      <div className="row bg-primary text-white rounded align-items-center p-2">
        
        {/* Left Side Content */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <h2 className="fw-bold mb-4">
            Book Appointment <br /> With 100+ Trusted Doctors
          </h2>
          <Link className="btn btn-light rounded-pill px-4 py-2 underline">
            Create account
          </Link>
        </div>

        {/* Right Side Image */}
        <div className="col-lg-6 text-center">
          {/* Replace with your doctor image */}
          <img src={assets.appointment_img} alt="Doctor" width={320} />
        </div>

      </div>
    </div>
  )
}

export default CTASection