import express from 'express'

import { addDoctor } from '../controllers/admin.controller.js'

const adminRouter=express.Router();


adminRouter.post('/add-doctor',upload.single('image'),addDoctor);


export default adminRouter