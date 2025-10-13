import express from "express";
import { bookAppointment, cancelAppointments, listAllAppointments, loginUser, registerUser, updateUserProfile, userProfile } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/user.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const userRouter=express.Router();

userRouter.use('/register',registerUser);
userRouter.use('/login',loginUser);
userRouter.use('/profile',authUser,userProfile);
userRouter.use('/update-profile',authUser,upload.single('image'),updateUserProfile);
userRouter.use('/book-appointment',authUser,bookAppointment);
userRouter.use('/list-appointments',authUser,listAllAppointments);
userRouter.use('/cancel-appointments',authUser,cancelAppointments);

export default userRouter