import express from "express";
import { dashboardData, doctorLogin, getAppointments, getDoctorProfile, listAllDoctors, markCompleteAppointment, updateDoctorProfile } from "../controllers/doctor.controller.js";
import { authDoctor } from "../middlewares/doctor.middleware.js";
// import { updateUserProfile } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
const doctorRouter=express.Router();


doctorRouter.use('/list',listAllDoctors);
doctorRouter.use('/login',doctorLogin);
doctorRouter.use('/appointments',authDoctor,getAppointments);
doctorRouter.use('/mark-appointment',authDoctor,markCompleteAppointment);
doctorRouter.use('/dashboard',authDoctor,dashboardData);
doctorRouter.use('/profile',authDoctor,getDoctorProfile);
doctorRouter.use('/update-profile',authDoctor,upload.single('image'),updateDoctorProfile);

export default doctorRouter;