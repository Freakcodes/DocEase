import React, { useState,useContext } from "react";
import axios from 'axios';
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin"); // new state for role
  

  const {setAdminToken,backendUrl}=useContext(AdminContext);

  const handleLogin = async (e) => { 
      e.preventDefault();

      try {
        if(role==="admin"){
          const {data}=await axios.post(backendUrl+'/api/admin/login',{email,password})
          if(data.success){
            setAdminToken(data.token);
            localStorage.setItem('adminToken',data.token);
          }else{
            toast.error(data.error);
          }
        }
      } catch (error) {
          toast.error(error);
      }
   }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
        <h3 className="text-center mb-4 ">
          {role === "admin" ? <span className="text-primary">Admin </span> :<span className="text-primary">Doctor </span> }Login
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder={`Enter ${role} email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder={`Enter ${role} password`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading}>
            {loading ? "Logging in..." : `Login as ${role}`}
          </button>
        </form>

        {/* Toggle Button */}
        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => setRole(role === "admin" ? "doctor" : "admin")}
        >
          Switch to {role === "admin" ? "Doctor" : "Admin"} Login
        </button>
      </div>
    </div>
  );
};

export default Login;
