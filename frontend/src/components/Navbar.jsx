import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';


const Navbar = () => {
  const { token, setToken,user } = useContext(AppContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-light">
      <div className="container">
        <Link className="navbar-brand text-primary fw-bold" to="/">DocEase</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/about">About</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/contacts">Contact Us</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/doctors">All Doctors</NavLink></li>
          </ul>

          <div className="ms-3 position-relative">
            {token ? (
              <div className="position-relative">
                <img
                  src={user?.image}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div className="position-absolute end-0 mt-2 bg-white shadow rounded py-2" style={{ minWidth: '150px', zIndex:'100' }}>
                    <Link to="/myprofile" className="dropdown-item px-3 py-2 text-dark text-decoration-none d-block" onClick={()=>setShowMenu(!showMenu)}>View Profile</Link>
                    <Link to="/appointments" className="dropdown-item px-3 py-2 text-dark text-decoration-none d-block" onClick={()=>setShowMenu(!showMenu)}>Appointments</Link>
                    <hr className="my-1" />
                    <button className="dropdown-item px-3 py-2 text-danger border-0 bg-transparent w-100 text-start" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink className="btn btn-outline-primary ms-3" to="/login">Create Account</NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
