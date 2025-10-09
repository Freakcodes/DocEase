import express from 'express'

import { addDoctor, getDoctor, loginAdmin } from '../controllers/admin.controller.js';

import upload from '../middlewares/multer.middleware.js';
import authAdmin from '../middlewares/authAdmin.middleware.js';
const adminRouter=express.Router();


adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.post('/login',loginAdmin);
adminRouter.get('/all-doctors',getDoctor);
export default adminRouter