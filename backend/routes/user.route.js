import express from "express";
import { bookAppointment, cancelAppointments, forgotPassword, getAppointment, listAllAppointments, loginUser, paymentRazorpay, registerUser, resetPassword, updateUserProfile, userProfile, verifyRazorPay,aiHealthAssistant, analyzeReport,chatWithReports } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/user.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import optionalAuth from "../middlewares/optionalAuth.middleware.js";
// import { aiHealthAssistant } from "../controllers/adminChat.controller.js";
const userRouter=express.Router();

userRouter.use('/register',registerUser);
userRouter.use('/login',loginUser);
userRouter.use('/forgot-password',forgotPassword);
userRouter.use('/reset-password/:token',resetPassword);
userRouter.use('/profile',authUser,userProfile);
userRouter.use('/update-profile',authUser,upload.single('image'),updateUserProfile);
userRouter.use('/book-appointment',authUser,bookAppointment);
userRouter.use('/list-appointments',authUser,listAllAppointments);
userRouter.use('/cancel-appointments',authUser,cancelAppointments);
userRouter.use('/payment-razorpay',authUser,paymentRazorpay);
userRouter.use('/verifyRazorpay',authUser,verifyRazorPay);
userRouter.use('/appointment',authUser,getAppointment);
//ai routes
userRouter.post('/ai-health-assistant',aiHealthAssistant);

userRouter.post('/ai-report-analysis',optionalAuth ,upload.array("reports",5),analyzeReport);
userRouter.use('/chat',authUser,chatWithReports)
export default userRouter

