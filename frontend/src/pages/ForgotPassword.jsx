import axios from "axios";
import React, { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
    const {backEndUrl}=useContext(AppContext);
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {
        const {data}=await axios.post(backEndUrl+`/api/user/forgot-password`,{email});
        if(data.success){
            toast.success(data.message);
        }else{
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="card shadow-lg border-0"
        style={{ width: "420px", borderRadius: "15px" }}
      >
        <div className="card-body p-4">
          <h3 className="text-center text-primary fw-bold mb-2">
            Forgot Password
          </h3>

          <p className="text-center text-muted mb-4">
            Enter your email to reset your password
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
            >
              Send Reset Link
            </button>
          </form>

          <div className="text-center mt-3">
            <small>
              Remember your password?{" "}
              <Link to="/login" className="text-primary fw-semibold">
                Login
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
