import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/admin.route.js";
import doctorRouter from "./routes/doctor.route.js";
import userRouter from "./routes/user.route.js";

//app config test

const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middlewares


app.use(express.json());
app.use(
  cors({
    origin: ["https://doc-ease-eta.vercel.app","http://localhost:5173","https://doc-ease-admin.vercel.app","http://localhost:5173"],
    credentials:true,
  })
);
//api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor",doctorRouter);
app.use("/api/user",userRouter)

app.get("/", (req, res) => {
  res.send("API WORKING FINE");
});

app.listen(port, () => {
  console.log("server started", port);
});
