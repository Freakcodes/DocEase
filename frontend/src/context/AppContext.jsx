import { createContext, useEffect,useState } from "react";
import { doctors } from "../assets/assets";
export const AppContext=createContext();
import axios from 'axios';
import { toast } from "react-toastify";
const AppContextProvider=(props)=>{
    const[doctors,setDoctors]=useState([]);
    const backEndUrl=import.meta.env.VITE_BACKEND_URL;
    const getDoctorsData=async()=>{
        try {
            const {data}=await axios.get(backEndUrl+'/api/doctor/list');
            if(data.success){
                setDoctors(data.doctors);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }
    useEffect(()=>{
        getDoctorsData();
    },[])
    const currencySymbol='$'
    const value={
        doctors,
        currencySymbol
    }
    
    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;