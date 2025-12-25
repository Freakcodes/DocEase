import React, { useContext } from 'react'
import "react-toastify/dist/ReactToastify.css";
import {ToastContainer} from 'react-toastify';
import {Route, Routes,Navigate} from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Contacts from './pages/Contacts'
import Login from './pages/Login'
import Appointments from './pages/Appointments'
import Doctors from './pages/Doctors'
import MyAppointments from './pages/MyAppointments'
import Footer from './components/Footer'
import MyProfile from './pages/MyProfile'
import { AppContext } from './context/AppContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
const App = () => {
  const {token}=useContext(AppContext);
  return (
    <div className="container">
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contacts' element={<Contacts/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password/:token' element={<ResetPassword/>}/>
        <Route path='/appointments/:id' element={<Appointments/>}/>
        <Route path='/doctors' element={<Doctors/>}/>
        <Route path='/doctors/:speciality' element={<Doctors/>}/>
        <Route 
          path='/appointments' 
          element={token ? <MyAppointments /> : <Navigate to="/login" />} 
        />
        <Route 
          path='/myprofile' 
          element={token ? <MyProfile /> : <Navigate to="/login" />} 
        />
        
      </Routes>
      <Footer/>
    </div>
  )
}

export default App