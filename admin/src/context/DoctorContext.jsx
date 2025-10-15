import { createContext,useState } from "react";

export const DoctorContext=createContext();


const DoctorContextProvider=(props)=>{
    
    const [doctortoken,setDoctortoken]=useState(localStorage.getItem('doctortoken')?localStorage.getItem('key'):null);
    const value={
        doctortoken,
        setDoctortoken
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}


export default DoctorContextProvider;