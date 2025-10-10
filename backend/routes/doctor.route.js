import express from "express";
import { listAllDoctors } from "../controllers/doctor.controller.js";

const doctorRouter=express.Router();


doctorRouter.use('/list',listAllDoctors);

export default doctorRouter;