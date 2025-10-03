import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin"); // new state for role

  // const handleLogin = async (e) => { ... }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
        <h3 className="text-center mb-4 ">
          {role === "admin" ? <span className="text-primary">Admin </span> :<span className="text-primary">Doctor </span> }Login
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form>
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
