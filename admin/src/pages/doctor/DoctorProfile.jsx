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
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (doctortoken) {
        setLoading(true);
        await getDoctorData();
        setLoading(false);
      }
    };
    fetchData();
  }, [doctortoken]);

  useEffect(() => {
    if (doctorData) {
      setPreviewImage(doctorData.image);
      setUserData(doctorData); // Keep existing data
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
      if (docImage) formData.append("image", docImage);

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

  // Shimmer Placeholder Component
  const ShimmerLine = ({ width = "100%", height = "20px", borderRadius = "4px" }) => (
    <div className="shimmer-line" style={{ width, height, borderRadius }}></div>
  );

  return (
    <div className="margin-left-side my-3">
      {loading ? (
        <div className="card shadow-lg border-0 rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <ShimmerLine width="200px" height="28px" />
            <ShimmerLine width="120px" height="36px" borderRadius="8px" />
          </div>

          <div className="row align-items-start">
            {/* Left side - Profile Image */}
            <div className="col-md-4 text-center">
              <ShimmerLine width="180px" height="180px" borderRadius="50%" />
              <ShimmerLine width="120px" height="36px" borderRadius="8px" className="mt-2" />
            </div>

            {/* Right side - Details */}
            <div className="col-md-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div className="mb-3" key={i}>
                  <ShimmerLine width={`${70 - i * 3}%`} height="20px" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
                    style={{ width: "180px", height: "180px", objectFit: "cover" }}
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
                  {/* Existing form fields remain unchanged */}
                  {/* Name */}
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

                  {/* Rest of fields remain unchanged */}
                  {/* Email, Speciality, Degree, Experience, Fees, About, Address, Availability */}
                  {/* ... */}
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
