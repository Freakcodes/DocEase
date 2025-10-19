
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import CTASection from "../components/CTASection";
import DoctorsToBook from "../components/DoctorsToBook";
import SpecialtySection from "../components/SpecialtySection";
import Doctors from "./Doctors";

const Home = () => {

  const navigate=useNavigate();
  return (
    <div className="container">
    <div className="row bg-primary text-white d-flex   mt-2 rounded ">
      
      <div
        className="col-lg-6 d-flex flex-column  justify-content-center rounded ml-4 "
        
      >
        <h1 className="text-center fw-bolder mt-2">Your Health, Your Time — Book Appointments Easily</h1>
        <div className="row  mt-4  text-center">
          <div className="col-lg-3 pl-4">
            <img src={assets.group_profiles} className="" />
          </div>
          <div className="col-lg-9 ">
            <p className="text-start">
              Simply browse through our extensive list of trusted doctors,
              schedule your appointment hassle-free.
            </p>
            
            
            
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 align-items-center d-flex justify-content-center">
            <div className="text-start">
              <button className="btn bg-gray bg-dark text-light " onClick={()=>navigate('/doctors')}>Book Your Appointment </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-6  rounded mr-2 " >
        <img src={assets.header_img} alt="home-img" className="hero-img" />
      </div>

      
    </div>
    <SpecialtySection/>

    <DoctorsToBook/>

    <CTASection/>
    </div>
  );
};

export default Home;
