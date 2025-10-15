import doctorModel from "../models/doctor.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
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

//api for doctor login..

const doctorLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const doctor=await doctorModel.findOne({email});
        if(!doctor){
            return res.json({
                success:false,
                message:"Doctor doesn't exist"
            })
        }
        const hashedPassword=doctor.password;
        const isMatch=await bcrypt.compare(password,hashedPassword);
        if(!isMatch){
            return res.json({success:false,message:"Invalid Password"});
        }
        const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET);

        return res.json({
            success:true,
            token,
            doctor
        })

    }catch(error){
        return res.json({success:false,message:error.message});
    }
}

export {toggleAvailability,listAllDoctors,doctorLogin};