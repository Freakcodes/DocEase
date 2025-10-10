import React, { useState, useEffect, useContext } from "react";
import { assets } from "../../assets/assets.js";
import { AdminContext } from "../../context/AdminContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AddDoctor = () => {
  const [loading, setLoading] = useState(false);
  const [docImage, setDocImage] = useState(null);
  const [about, setAbout] = useState("");
  const [name, setName] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [fees, setFees] = useState("");
  const navigate = useNavigate();
  const { backendUrl, adminToken } = useContext(AdminContext);
  // Load saved data from localStorage on load
  useEffect(() => {
    const savedData = localStorage.getItem("doctorData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setDocImage(
        parsed.docImage ? dataURLtoFile(parsed.docImage, "doctor.png") : null
      );
      setAbout(parsed.about || "");
      setName(parsed.name || "");
      setSpeciality(parsed.speciality || "");
      setEmail(parsed.email || "");
      setPassword(parsed.password || "");
      setEducation(parsed.education || "");
      setExperience(parsed.experience || "");
      setAddress1(parsed.address1 || "");
      setAddress2(parsed.address2 || "");
      setFees(parsed.fees || "");
    }
  }, []);

  //  Convert base64 string to File (for reloading image)
  const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl) return null;
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  //  Auto-save whenever data changes
  useEffect(() => {
    const saveData = async () => {
      const imageBase64 = docImage ? await fileToBase64(docImage) : "";
      const doctorData = {
        docImage: imageBase64,
        about,
        name,
        speciality,
        email,
        password,
        education,
        experience,
        address1,
        address2,
        fees,
      };
      localStorage.setItem("doctorData", JSON.stringify(doctorData));
    };

    saveData();
  }, [
    docImage,
    about,
    name,
    speciality,
    email,
    password,
    education,
    experience,
    address1,
    address2,
    fees,
  ]);

  //  Helper: convert File → base64 for localStorage
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleClear = () => {
    localStorage.removeItem("doctorData");
    window.location.reload();
  };
  //Function to send data to the backend server
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!docImage) {
        return toast.error("Image is required");
      }
      setLoading(true);
      const formData = new FormData();
      formData.append("image", docImage);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", education);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      );

      const { data } = await axios.post(
        backendUrl + `/api/admin/add-doctor`,
        formData,
        { headers: { admintoken: adminToken } }
      );
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        setAbout('');
        setAddress1('');
        setAddress2('');
        setDocImage('');
        setEducation('');
        setEmail('');
        setExperience('');
        setFees('');
        setLoading('');
        setName('');
        setPassword('');
        setSpeciality('');
      } else {
        toast.error(data.message);
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.message); 
    }
  };

  return (
    <div className="margin-left-side mt-4 mb-5">
      <div className="card shadow-sm border-0 p-4">
        <h4 className="mb-4 fw-semibold">Add Doctor</h4>

        {/* Upload section */}
        <div className="text-center mb-4">
          <label htmlFor="doc-img" className="d-block">
            <img
              src={
                docImage ? URL.createObjectURL(docImage) : assets.upload_area
              }
              alt="upload doctor"
              className="rounded-circle border p-2"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </label>
          <p className="text-muted small mt-2">Upload doctor picture</p>
          <input
            type="file"
            id="doc-img"
            className="d-none"
            onChange={(e) => setDocImage(e.target.files[0])}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Doctor Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Speciality</label>
              <select
                className="form-select"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
              >
                <option value="">Select Speciality</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Pediatricians">Pediatricians</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Doctor Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Education</label>
              <input
                type="text"
                className="form-control"
                placeholder="Education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Doctor Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Experience</label>
              <select
                className="form-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Select Experience</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Fees</label>
              <input
                type="number"
                className="form-control"
                placeholder="Your fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Address 1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Address 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label">About me</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Write about yourself"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              ></textarea>
            </div>

            <div className="col-12 text-center mt-3">
              {loading ? (
                <button
                  type="submit"
                  disabled
                  className="btn btn-primary px-4 me-2"
                >
                  Loading....
                </button>
              ) : (
                <button type="submit" className="btn btn-primary px-4 me-2">
                  Add Doctor
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline-danger px-4"
                onClick={handleClear}
              >
                Clear Form
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
