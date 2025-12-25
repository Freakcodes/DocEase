import axios from "axios";
import React, { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const { backEndUrl } = useContext(AppContext);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const { data } = await axios.post(
      backEndUrl + `/api/user/reset-password/${token}`,
      { password: newPassword }
    );
    if (data.success) {
      toast.success(data.message);
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(data.message);
    }

    // call reset-password API here
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="card shadow-lg border-0"
        style={{ width: "420px", borderRadius: "15px" }}
      >
        <div className="card-body p-4">
          <h3 className="text-center text-primary fw-bold mb-2">
            Reset Password
          </h3>

          <p className="text-center text-muted mb-4">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">New Password</label>
              <input
                type="password"
                className="form-control py-2"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control py-2"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
            >
              Reset Password
            </button>
          </form>

          <div className="text-center mt-3">
            <small>
              Back to{" "}
              <Link to='/login' className="text-primary fw-semibold">
                Login
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
