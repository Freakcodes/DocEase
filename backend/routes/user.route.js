import express from "express";
import { loginUser, registerUser, userProfile } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/user.middleware.js";

const userRouter=express.Router();

userRouter.use('/register',registerUser);
userRouter.use('/login',loginUser);
userRouter.use('/profile',authUser,userProfile);

export default userRouter