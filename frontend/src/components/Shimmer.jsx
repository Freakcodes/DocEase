import React from 'react';

const Shimmer = ({ length = 4 }) => {
  return (
    <>
      {Array.from({ length }).map((_, index) => (
        <div className="col-lg-3 col-12 mb-4" key={index}>
          <div className="border doctor-card-outer p-3 rounded shadow-sm h-100 d-flex flex-column align-items-center">
            <div className="shimmer-img rounded mb-3"></div>
            <div className="shimmer-line w-75 mb-2"></div>
            <div className="shimmer-line w-50"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Shimmer;
