import React, { useEffect, useState } from "react";

const Login = () => {
  const [state, setState] = useState("Sign up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log(name, email, password);
  };

  useEffect(() => {
    console.log(name);
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-100">
        <div className="col-md-6 offset-md-3 col-lg-4 offset-lg-4">
          <div className="card shadow-lg rounded-4">
            <div className="card-body p-4">
              <h3 className="text-center mb-2 text-primary">
                {state === "Sign up" ? "Create Account" : "Login"}
              </h3>
              <p className="text-muted text-center mb-4">
                Please {state === "Sign up" ? "sign up" : "log in"} to book an
                appointment
              </p>

              <form onSubmit={onSubmitHandler}>
                {state === "Sign up" && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  {state === "Sign up" ? "Sign Up" : "Login"}
                </button>
              </form>

              <div className="text-center mt-3">
                <small>
                  {state === "Sign up"
                    ? "Already have an account? "
                    : "Don't have an account? "}
                  <span
                    className="text-primary fw-bold"
                    role="button"
                    onClick={() =>
                      setState(state === "Sign up" ? "Login" : "Sign up")
                    }
                  >
                    {state === "Sign up" ? "Login" : "Sign up"}
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
