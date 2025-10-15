import express from "express";
import { doctorLogin, getAppointments, listAllDoctors, markCompleteAppointment } from "../controllers/doctor.controller.js";
import { authDoctor } from "../middlewares/doctor.middleware.js";

const doctorRouter=express.Router();


doctorRouter.use('/list',listAllDoctors);
doctorRouter.use('/login',doctorLogin);
doctorRouter.use('/appointments',authDoctor,getAppointments);
doctorRouter.use('/mark-appointment',authDoctor,markCompleteAppointment);
export default doctorRouter;