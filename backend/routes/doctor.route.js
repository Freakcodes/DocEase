import express from "express";
import { doctorLogin, listAllDoctors } from "../controllers/doctor.controller.js";

const doctorRouter=express.Router();


doctorRouter.use('/list',listAllDoctors);
doctorRouter.use('/login',doctorLogin);
export default doctorRouter;