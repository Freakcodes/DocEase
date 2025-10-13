import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const { user, setUser, backEndUrl, token, getUserProfile } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [userData, setUserData] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setUserData({
        ...user,
        address: user.address || { line1: "", line2: "" },
      });
      setPreviewImage(user.image || null);
    }
  }, [user]);
  if (!token) {
    toast.warn("You need to login first");
    return navigate("/login");
  }
  if (!userData) return <p>Loading profile...</p>;

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDocImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!isEdit) return;

    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("phone", userData.phone);
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append(
        "address",
        JSON.stringify({
          line1: userData.address.line1,
          line2: userData.address.line2,
        })
      );
      console.log(formData);
      if (docImage) formData.append("image", docImage);
      const { data } = await axios.post(
        backEndUrl + "/api/user/update-profile",
        formData,
        {
          headers: {
            usertoken: token,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        await getUserProfile();
        setIsEdit(false); // close edit mode
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating profile");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <div className="row align-items-center">
          <div className="col-md-3 text-center">
            <img
              src={previewImage || ""}
              alt="profile"
              className="img-fluid rounded-circle mb-3"
            />
            {isEdit && (
              <input type="file" name="image" onChange={handleFileChange} />
            )}
            <button
              className="btn btn-primary btn-sm mt-2"
              onClick={() => {
                if (isEdit) {
                  handleSave();
                } else {
                  setIsEdit(true);
                }
              }}
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

            {/* Phone & Gender */}
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

            {/* DOB */}
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

            {/* Address */}
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

export default MyProfile;
