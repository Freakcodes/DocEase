import React, { useState, useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// ── Field helper — defined OUTSIDE the component so it isn't
//    recreated on every render. Recreating it on every render caused
//    React to treat it as a new component type each time, which
//    unmounted/remounted the inputs underneath it — most noticeably
//    on the <input type="time"> fields, since their multi-segment
//    (hour/minute) focus gets reset to the first segment on remount,
//    making them feel impossible to type into. ─────────────────────
const Field = ({ label, icon, name, type = "text", value, isEdit, onChange, children }) => (
  <div>
    <label className="small fw-bold text-muted text-uppercase mb-1 d-block" style={{ letterSpacing: "0.5px" }}>
      <i className={`bi ${icon} me-1 text-primary`}></i>{label}
    </label>
    {isEdit ? (
      children || (
        <input
          type={type}
          className="form-control rounded-3"
          name={name}
          value={value || ""}
          onChange={onChange}
        />
      )
    ) : (
      <p className="mb-0 fw-medium text-dark">{value || "—"}</p>
    )}
  </div>
);

const DoctorProfile = () => {
  const { doctorData, getDoctorData, doctortoken, backendUrl } = useContext(DoctorContext);

  const [isEdit, setIsEdit] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setUserData({
        ...doctorData,
        timings: doctorData.timings || { start: "09:00", end: "17:00" },
        slotDuration: doctorData.slotDuration || 30,
        availableDays: doctorData.availableDays || ["MON", "TUE", "WED", "THU", "FRI"],
      });
      setLoading(false);
    }
  }, [doctorData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "line1" || name === "line2") {
      setUserData((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleDay = (day) => {
    setUserData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleCancel = () => {
    setIsEdit(false);
    setDocImage(null);
    setPreviewImage(doctorData.image);
    setUserData({
      ...doctorData,
      timings: doctorData.timings || { start: "09:00", end: "17:00" },
      slotDuration: doctorData.slotDuration || 30,
      availableDays: doctorData.availableDays || ["MON", "TUE", "WED", "THU", "FRI"],
    });
  };

  const handleSave = async () => {
    if (!isEdit) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("speciality", userData.speciality);
      formData.append("degree", userData.degree);
      formData.append("experience", userData.experience);
      formData.append("fees", userData.fees);
      formData.append("about", userData.about);
      formData.append("address", JSON.stringify({ line1: userData.address.line1, line2: userData.address.line2 }));
      formData.append("startTime", userData.timings.start);
      formData.append("endTime", userData.timings.end);
      formData.append("slotDuration", userData.slotDuration);
      formData.append("availableDays", JSON.stringify(userData.availableDays));
      if (docImage) formData.append("image", docImage);

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        formData,
        { headers: { doctortoken } }
      );

      if (data.success) {
        toast.success("Profile updated successfully");
        await getDoctorData();
        setIsEdit(false);
        setDocImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Shimmer ───────────────────────────────────────────────────────────
  if (loading || !userData) {
    return (
      <div className="p-4">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex gap-4 align-items-start">
            <div className="rounded-circle bg-secondary bg-opacity-10 flex-shrink-0"
              style={{ width: "110px", height: "110px" }}></div>
            <div className="flex-grow-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-secondary bg-opacity-10 rounded mb-3"
                  style={{ height: "16px", width: i % 2 === 0 ? "55%" : "35%" }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 px-3 margin-left-side ">
      <div style={{ maxWidth: "860px" }}>

        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="mb-4">
          <p className="text-primary fw-semibold small text-uppercase mb-1">
            <i className="bi bi-person-badge me-1"></i> Doctor Panel
          </p>
          <h4 className="fw-bold mb-0">My Profile</h4>
        </div>

        {/* ── Profile Card ──────────────────────────────────────── */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="bg-primary" style={{ height: "4px" }}></div>
          <div className="card-body p-4">

            {/* ── Avatar + Name ── */}
            <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 pb-4 border-bottom mb-4">
              <div className="position-relative flex-shrink-0">
                <img
                  src={previewImage}
                  alt="Doctor"
                  className="rounded-circle border border-3 border-white shadow"
                  style={{ width: "110px", height: "110px", objectFit: "cover" }}
                />
                {isEdit && (
                  <label
                    htmlFor="docAvatarUpload"
                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center shadow"
                    style={{ width: "30px", height: "30px", cursor: "pointer" }}
                  >
                    <i className="bi bi-camera-fill text-white small"></i>
                    <input id="docAvatarUpload" type="file" accept="image/*" className="d-none" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div className="flex-grow-1 text-center text-sm-start">
                <h5 className="fw-bold mb-1">{userData.name}</h5>
                <p className="text-muted small mb-1">{userData.speciality}</p>
                <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start mb-3">
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                    {userData.degree}
                  </span>
                  <span className="badge bg-light text-dark border rounded-pill px-3">
                    {userData.experience}
                  </span>
                  <span className={`badge rounded-pill px-3 ${userData.available ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                    <i className={`bi ${userData.available ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                    {userData.available ? "Available" : "Unavailable"}
                  </span>
                </div>

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
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                        : <><i className="bi bi-check-lg me-2"></i>Save Changes</>
                      }
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

            {/* ── Personal Info ── */}
            <p className="small fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: "1px" }}>
              Personal Information
            </p>
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <Field label="Full Name" icon="bi-person" name="name" value={userData.name} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Email Address" icon="bi-envelope" name="email" type="email" value={userData.email} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Speciality" icon="bi-heart-pulse" name="speciality" value={userData.speciality} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-3">
                <Field label="Degree" icon="bi-mortarboard" name="degree" value={userData.degree} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-3">
                <Field label="Experience" icon="bi-briefcase" name="experience" value={userData.experience} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-4">
                <Field label="Consultation Fee (₹)" icon="bi-currency-rupee" name="fees" type="number" value={userData.fees} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12">
                <Field label="About" icon="bi-info-circle" name="about" value={userData.about} isEdit={isEdit} onChange={handleChange}>
                  {isEdit && (
                    <textarea
                      className="form-control rounded-3"
                      name="about"
                      rows={3}
                      value={userData.about || ""}
                      onChange={handleChange}
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* ── Address ── */}
            <p className="small fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: "1px" }}>
              Address
            </p>
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <Field label="Address Line 1" icon="bi-geo-alt" name="line1" value={userData.address?.line1} isEdit={isEdit} onChange={handleChange} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Address Line 2" icon="bi-geo" name="line2" value={userData.address?.line2} isEdit={isEdit} onChange={handleChange} />
              </div>
            </div>

            {/* ── Availability Settings ── */}
            <p className="small fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: "1px" }}>
              Availability Settings
            </p>
            <div className="row g-4">
              <div className="col-12 col-md-4">
                <Field
                  label="Start Time"
                  icon="bi-clock"
                  value={userData.timings?.start}
                  isEdit={isEdit}
                >
                  {isEdit && (
                    <input
                      type="time"
                      className="form-control rounded-3"
                      value={userData.timings?.start || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, timings: { ...prev.timings, start: e.target.value } }))
                      }
                    />
                  )}
                </Field>
              </div>
              <div className="col-12 col-md-4">
                <Field
                  label="End Time"
                  icon="bi-clock-history"
                  value={userData.timings?.end}
                  isEdit={isEdit}
                >
                  {isEdit && (
                    <input
                      type="time"
                      className="form-control rounded-3"
                      value={userData.timings?.end || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, timings: { ...prev.timings, end: e.target.value } }))
                      }
                    />
                  )}
                </Field>
              </div>
              <div className="col-12 col-md-4">
                <Field
                  label="Slot Duration"
                  icon="bi-stopwatch"
                  value={`${userData.slotDuration} mins`}
                  isEdit={isEdit}
                >
                  {isEdit && (
                    <select
                      className="form-select rounded-3"
                      value={userData.slotDuration}
                      onChange={(e) =>
                        setUserData((prev) => ({ ...prev, slotDuration: Number(e.target.value) }))
                      }
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  )}
                </Field>
              </div>

              <div className="col-12">
                <label className="small fw-bold text-muted text-uppercase mb-2 d-block" style={{ letterSpacing: "0.5px" }}>
                  <i className="bi bi-calendar3 me-1 text-primary"></i>Available Days
                </label>
                {isEdit ? (
                  <div className="d-flex gap-2 flex-wrap">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`btn btn-sm rounded-3 fw-semibold px-3 ${
                          userData.availableDays?.includes(day)
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="d-flex gap-2 flex-wrap">
                    {DAYS.map((day) => (
                      <span
                        key={day}
                        className={`badge rounded-3 px-3 py-2 ${
                          userData.availableDays?.includes(day)
                            ? "bg-primary"
                            : "bg-light text-muted border"
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;