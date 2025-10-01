
import validator from "validator"
//api for adding the doctor
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctor.model.js"
import jwt from "jsonwebtoken"


const addDoctor=async( req,res)=>{
    try {
        const {name,email,password,speciality,degree,experience,about,fees,address,available}=req.body;
        const imageFile=req.file;
       //Checking for all the data 

       if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile){
        return res.json({success:false,message:"Fields are missing"})
       }

       if(!validator.isEmail(email)){
        return res.json({success:false,message:"Please enter a valid email"});
       }

       if(password.length<0)
       {
        return res.json({success:false,message:"Please Enter a strong password "})
       }

       //hashing the password
       const salt=await bcrypt.genSalt(8);
       const hashedPassword=await bcrypt.hash(password,salt);

       //upload image to cloudinary...
       const imageUpload= await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"});
       const imageUrl=imageUpload.secure_url;
      
       const doctorData={
        name,
        email,
        image:imageUrl,
        password:hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        available,
        address:JSON.parse(address),
       }

       const newDoctor=new doctorModel(doctorData);
       await newDoctor.save();

       res.json({
        success:true,
        message:"Doctor Added"
       })
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}

const loginAdmin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token=jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid Credentials"})
        }
    } catch (error) {
        res.json(
            {
                success:'false',
                message:error.message
            }
        )
    } 
}

export {addDoctor,loginAdmin}