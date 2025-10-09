import doctorModel from "../models/doctor.model.js";

const toggleAvailability=async(req,res)=>{
    try {
        const {docId}=req.body;
        
        const docData=await doctorModel.findById(docId);
         await doctorModel.findByIdAndUpdate(docId,{available:!docData.available});
        
        res.json({success:true,message:'Availability Changed'})
    } catch (error) {
        console.log(error);
    }
  
}

export {toggleAvailability};