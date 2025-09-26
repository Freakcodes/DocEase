import React from 'react'
import { useState } from 'react';
import { assets } from '../assets/assets';
const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "Edward Vincent",
    image: `${assets.profile_pic}`, // dummy image
    email: "richardjameswap@gmail.com",
    phone: "+1 123 456 7890",
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Church Road, London",
    },
    gender: "Male",
    dob: "2000-01-20",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "line1" || name === "line2") {
      setUserData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <div className="row align-items-center">
          <div className="col-md-3 text-center">
            <img
              src={userData.image}
              alt="profile"
              className="img-fluid rounded-circle mb-3"
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsEdit(!isEdit)}
            >
              {isEdit ? "Save" : "Edit Profile"}
            </button>
          </div>

          <div className="col-md-9">
            <div className="row mb-2">
              <div className="col-md-6">
                <label className="fw-bold">Name:</label>
                {isEdit ? (
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{userData.name}</p>
                )}
              </div>

              <div className="col-md-6">
                <label className="fw-bold">Email:</label>
                {isEdit ? (
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{userData.email}</p>
                )}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-6">
                <label className="fw-bold">Phone:</label>
                {isEdit ? (
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{userData.phone}</p>
                )}
              </div>

              <div className="col-md-6">
                <label className="fw-bold">Gender:</label>
                {isEdit ? (
                  <select
                    className="form-select"
                    name="gender"
                    value={userData.gender}
                    onChange={handleChange}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <p>{userData.gender}</p>
                )}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-6">
                <label className="fw-bold">DOB:</label>
                {isEdit ? (
                  <input
                    type="date"
                    className="form-control"
                    name="dob"
                    value={userData.dob}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{userData.dob}</p>
                )}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-12">
                <label className="fw-bold">Address:</label>
                {isEdit ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="line1"
                      value={userData.address.line1}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      className="form-control"
                      name="line2"
                      value={userData.address.line2}
                      onChange={handleChange}
                    />
                  </>
                ) : (
                  <p>
                    {userData.address.line1}, {userData.address.line2}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile