import express from 'express'

import { addDoctor, appointmentsAdmin, cancelAppointments, getDoctor, loginAdmin } from '../controllers/admin.controller.js';

import upload from '../middlewares/multer.middleware.js';
import authAdmin from '../middlewares/authAdmin.middleware.js';
import { toggleAvailability } from '../controllers/doctor.controller.js';
const adminRouter=express.Router();


adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.post('/login',loginAdmin);
adminRouter.get('/all-doctors',getDoctor);
adminRouter.post('/change-availability',authAdmin,toggleAvailability);
adminRouter.get('/appointments',authAdmin,appointmentsAdmin);
adminRouter.post('/cancel-appointment',authAdmin,cancelAppointments);

export default adminRouter