import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const MyAppointments = () => {
  const { doctors } = useContext(AppContext);

  return (
    <div className="container py-5">
      <h3 className="mb-4 text-primary">My Appointments</h3>
      <div className="row">
        {doctors.slice(0, 4).map((doc, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={doc.image}
                alt="doc-img"
                className="card-img-top"
                style={{ height: '200px', objectFit: 'contain' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{doc.name}</h5>
                <p className="text-muted mb-2">{doc.speciality}</p>
                <div className="mb-3">
                  <p className="mb-1 fw-bold">Address:</p>
                  <p className="mb-0">{doc.address.line1}</p>
                  <p className="mb-0">{doc.address.line2}</p>
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
