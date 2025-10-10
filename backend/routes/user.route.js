import express from "express";
import { registerUser } from "../controllers/user.controller.js";

const userRouter=express.Router();

userRouter.use('/register',registerUser);

export default userRouter