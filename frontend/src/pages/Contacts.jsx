import React from 'react'
import { assets } from '../assets/assets';
const Contacts = () => {
  
  return (
    <section className="container py-5">
      <h2 className="fw-bold mb-4 text-center">
        Contact <span className="text-primary">Us</span>
      </h2>

      <div className="row justify-content-center align-items-center">

        <div className="col-md-4">
          <img src={assets.contact_image} alt="contact" height={300}/>
        </div>
        <div className="col-md-4 ">
          <p className="mb-2">
            <strong>Address:</strong> 123 Health Street, Wellness City, 45678
          </p>
          <p className="mb-2">
            <strong>Phone:</strong> +91 98765 43210
          </p>
          <p className="mb-2">
            <strong>Email:</strong> info@docease.com
          </p>
          <p className="mb-2">
            <strong>Working Hours:</strong> Mon - Sat: 10:00 AM - 9:00 PM
          </p>
        </div>
      </div>
    </section>
  );
}

export default Contacts