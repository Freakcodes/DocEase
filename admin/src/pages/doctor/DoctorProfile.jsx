import React, { useState, useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { doctorData, getDoctorData, doctortoken, backendUrl } =
    useContext(DoctorContext);

  const [isEdit, setIsEdit] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 shimmer state

  useEffect(() => {
    const fetchDoctor = async () => {
      if (doctortoken) {
        setLoading(true);
        await getDoctorData();
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctortoken]);

  useEffect(() => {
    if (doctorData) {
      setPreviewImage(doctorData.image);
      setUserData(doctorData);
      setLoading(false);
    }
  }, [doctorData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setDocImage(file);
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

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

  const handleSave = async () => {
    if (!isEdit) return;
    try {
      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("speciality", userData.speciality);
      formData.append("degree", userData.degree);
      formData.append("experience", userData.experience);
      formData.append("fees", userData.fees);
      formData.append("about", userData.about);
      formData.append(
        "address",
        JSON.stringify({
          line1: userData.address.line1,
          line2: userData.address.line2,
        })
      );

      if (docImage) {
        formData.append("image", docImage);
      }

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        formData,
        { headers: { doctortoken: doctortoken } }
      );

      if (data.success) {
        toast.success("Profile Updated Successfully");
        getDoctorData();
        setIsEdit(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating profile.");
    }
  };

  // 🩺 SHIMMER loader
  const ShimmerProfile = () => (
    <div className="card shadow-lg border-0 rounded-4 p-4 doctor-shimmer-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="doctor-shimmer-title shimmer"></div>
        <div className="doctor-shimmer-btn shimmer"></div>
      </div>
      <div className="row">
        <div className="col-md-4 text-center">
          <div className="doctor-shimmer-circle shimmer mb-3 mx-auto"></div>
          <div className="doctor-shimmer-line shimmer mt-2"></div>
        </div>
        <div className="col-md-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="doctor-shimmer-line shimmer mb-3"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="margin-left-side my-3">
      {loading ? (
        <ShimmerProfile />
      ) : (
        userData && (
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Doctor Profile</h4>
                <button
                  className={`btn btn-${isEdit ? "success" : "primary"}`}
                  onClick={() => {
                    if (isEdit) handleSave();
                    else setIsEdit(true);
                  }}
                >
                  {isEdit ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="row align-items-start">
                {/* Left side - Profile Image */}
                <div className="col-md-4 text-center">
                  <img
                    src={previewImage}
                    alt="Doctor"
                    className="img-fluid rounded-circle border shadow-sm mb-3"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                  {isEdit && (
                    <input
                      type="file"
                      className="form-control mt-2"
                      onChange={handleImageChange}
                    />
                  )}
                </div>

                {/* Right side - Details */}
                <div className="col-md-8">
                  {/* All your existing fields (unchanged) */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Name</label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={userData?.name || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">{userData?.name}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    {isEdit ? (
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={userData?.email || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">
                        {userData?.email}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Speciality</label>
                    {isEdit ? (
                      <input
                        type="text"
                        name="speciality"
                        className="form-control"
                        value={userData?.speciality || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">
                        {userData?.speciality}
                      </p>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Degree</label>
                      {isEdit ? (
                        <input
                          type="text"
                          name="degree"
                          className="form-control"
                          value={userData?.degree || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">
                          {userData?.degree}
                        </p>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Experience</label>
                      {isEdit ? (
                        <input
                          type="text"
                          name="experience"
                          className="form-control"
                          value={userData?.experience || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">
                          {userData?.experience}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Consultation Fee
                    </label>
                    {isEdit ? (
                      <input
                        type="number"
                        name="fees"
                        className="form-control"
                        value={userData?.fees || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-control-plaintext">
                        ${userData?.fees}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">About</label>
                    {isEdit ? (
                      <textarea
                        className="form-control"
                        name="about"
                        rows="3"
                        value={userData?.about || ""}
                        onChange={handleChange}
                      ></textarea>
                    ) : (
                      <p className="form-control-plaintext text-muted">
                        {userData?.about}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Address</label>
                    {isEdit ? (
                      <>
                        <input
                          type="text"
                          name="line1"
                          className="form-control mb-2"
                          placeholder="Address Line 1"
                          value={userData?.address?.line1 || ""}
                          onChange={handleChange}
                        />
                        <input
                          type="text"
                          name="line2"
                          className="form-control"
                          placeholder="Address Line 2"
                          value={userData?.address?.line2 || ""}
                          onChange={handleChange}
                        />
                      </>
                    ) : (
                      <p className="form-control-plaintext">
                        {userData?.address?.line1}, {userData?.address?.line2}
                      </p>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold me-2">Available:</label>
                    <span
                      className={`badge ${
                        userData?.available ? "bg-success" : "bg-danger"
                      } px-3 py-2`}
                    >
                      {userData?.available ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DoctorProfile;
