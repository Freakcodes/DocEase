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

const listAllDoctors=async(req,res)=>{
    try {
        const doctors=await doctorModel.find({}).select(['-email,-password']);
        res.json({success:true,doctors})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export {toggleAvailability,listAllDoctors};