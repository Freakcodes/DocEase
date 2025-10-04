import { useContext, useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Login from './pages/Login';
import {ToastContainer,toast} from 'react-toastify'
import { AdminContext } from './context/AdminContext';
function App() {
 const {adminToken}=useContext(AdminContext);


  return adminToken ?(
    <>
      <h1>{adminToken}</h1>
      <ToastContainer/>
    </>
  ):(
    <>
    <Login/>
    <ToastContainer/>
    
    </>
  )
}

export default App
