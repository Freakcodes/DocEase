import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext';
import {useNavigate} from 'react-router-dom'
const Navbar = () => {
    const {adminToken,setAdminToken}=useContext(AdminContext);

    const navigate=useNavigate();
    const handleLogout=()=>{
        navigate('/');
        adminToken && setAdminToken('')
        adminToken && localStorage.removeItem('adminToken');
    }
    return (
       
        adminToken && <nav className="navbar navbar-expand-lg border-bottom px-3">
          <a className="navbar-brand fw-bold " href="/admin/dashboard">
            <span className='text-primary'>DocEase</span> Admin
          </a>
    
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavbar"
            aria-controls="adminNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
    
          <div className="collapse navbar-collapse" id="adminNavbar">
            
            <button
              onClick={handleLogout}
              className="btn btn-primary ms-auto"
            >
              Logout
            </button>
          </div>
        </nav>
      );
}

export default Navbar