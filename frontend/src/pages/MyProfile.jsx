import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const { user, backEndUrl, token, getUserProfile } = useContext(AppContext);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [userData, setUserData] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

              // Helper to convert any date string to YYYY-MM-DD
const toInputDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};
  useEffect(() => {
    if (!token) {
      toast.warn("You need to login first");
      navigate("/login");
      return;
    }
    if (user && Object.keys(user).length > 0) {
      setUserData({
        ...user,
        address: user.address || { line1: "", line2: "" },
      });
      setPreviewImage(user.image || null);
      setLoading(false);
    } else {
      (async () => {
        setLoading(true);
        await getUserProfile();
        setLoading(false);
      })();
    }
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "line1" || name === "line2") {
      setUserData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!isEdit) return;
    try {
      setSaving(true);
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
        }),
      );
      if (docImage) formData.append("image", docImage);

      const { data } = await axios.post(
        backEndUrl + "/api/user/update-profile",
        formData,
        {
          headers: { usertoken: token },
        },
      );

      if (data.success) {
        toast.success(data.message);
        await getUserProfile();
        setIsEdit(false);
        setDocImage(null);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEdit(false);
    setDocImage(null);
    setPreviewImage(user.image || null);
    setUserData({ ...user, address: user.address || { line1: "", line2: "" } });
  };

  if (loading || !userData) {
    return (
      <div className="bg-light min-vh-100 py-5">
        <div className="container" style={{ maxWidth: "780px" }}>
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex gap-4 align-items-start">
              <div
                className="rounded-circle bg-secondary bg-opacity-10 flex-shrink-0"
                style={{ width: "100px", height: "100px" }}
              ></div>
              <div className="flex-grow-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-secondary bg-opacity-10 rounded mb-3"
                    style={{
                      height: "16px",
                      width: i % 2 === 0 ? "60%" : "40%",
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Field = ({ label, icon, name, type = "text", value, children }) => (
    <div>
      <label
        className="small fw-bold text-muted text-uppercase mb-1 d-block"
        style={{ letterSpacing: "0.5px" }}
      >
        <i className={`bi ${icon} me-1 text-primary`}></i>
        {label}
      </label>
      {isEdit ? (
        children || (
          <input
            type={type}
            className="form-control rounded-3 border"
            name={name}
            value={value}
            onChange={handleChange}
          />
        )
      ) : (
        <p className="mb-0 fw-medium text-dark">{value || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="mb-4">
          <p className="text-primary fw-semibold small text-uppercase mb-1">
            <i className="bi bi-person-circle me-1"></i> Account
          </p>
          <h4 className="fw-bold mb-0">My Profile</h4>
        </div>

        {/* ── Profile Card ──────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="bg-primary" style={{ height: "4px" }}></div>

          <div className="card-body p-4">
            {/* ── Avatar + Name row ── */}
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 pb-4 border-bottom mb-4">
              {/* Avatar */}
              <div className="position-relative flex-shrink-0">
                <img
                  src={previewImage || "https://via.placeholder.com/100"}
                  alt="profile"
                  className="rounded-circle border border-3 border-white shadow"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                {isEdit && (
                  <label
                    htmlFor="avatarUpload"
                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center shadow"
                    style={{ width: "30px", height: "30px", cursor: "pointer" }}
                  >
                    <i className="bi bi-camera-fill text-white small"></i>
                    <input
                      id="avatarUpload"
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {/* Name + edit button */}
              <div className="flex-grow-1 text-center text-sm-start">
                <h5 className="fw-bold mb-1">{userData.name}</h5>
                <p className="text-muted small mb-3">{userData.email}</p>

                {!isEdit ? (
                  <button
                    className="btn btn-outline-primary btn-sm rounded-3 px-4 fw-semibold"
                    onClick={() => setIsEdit(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>Edit Profile
                  </button>
                ) : (
                  <div className="d-flex gap-2 justify-content-center justify-content-sm-start">
                    <button
                      className="btn btn-primary btn-sm rounded-3 px-4 fw-semibold"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>Save Changes
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-3 px-3 fw-semibold"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Fields ── */}
            <div className="row g-4">
              {/* Personal Info heading */}
              <div className="col-12">
                <p
                  className="small fw-bold text-uppercase text-muted mb-0"
                  style={{ letterSpacing: "1px" }}
                >
                  Personal Information
                </p>
              </div>
              <div className="col-12 col-md-6">
                <Field
                  label="Full Name"
                  icon="bi-person"
                  name="name"
                  value={userData.name}
                />
              </div>
              <div className="col-12 col-md-6">
                <Field
                  label="Email Address"
                  icon="bi-envelope"
                  name="email"
                  type="email"
                  value={userData.email}
                />
              </div>
              <div className="col-12 col-md-6">
                <Field
                  label="Phone Number"
                  icon="bi-telephone"
                  name="phone"
                  value={userData.phone}
                />
              </div>
              
              <Field
                label="Date of Birth"
                icon="bi-calendar-date"
                name="dob"
                type="date"
                value={toInputDate(userData.dob)}
              />
              <div className="col-12 col-md-6">
                <Field
                  label="Gender"
                  icon="bi-gender-ambiguous"
                  name="gender"
                  value={userData.gender}
                >
                  {isEdit && (
                    <select
                      className="form-select rounded-3 border"
                      name="gender"
                      value={userData.gender}
                      onChange={handleChange}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  )}
                </Field>
              </div>
              {/* Address heading */}
              <div className="col-12 mt-2">
                <p
                  className="small fw-bold text-uppercase text-muted mb-0"
                  style={{ letterSpacing: "1px" }}
                >
                  Address
                </p>
              </div>
              <div className="col-12 col-md-6">
                <Field
                  label="Address Line 1"
                  icon="bi-geo-alt"
                  name="line1"
                  value={userData.address.line1}
                />
              </div>
              <div className="col-12 col-md-6">
                <Field
                  label="Address Line 2"
                  icon="bi-geo"
                  name="line2"
                  value={userData.address.line2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
