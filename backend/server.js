import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/admin.route.js";
import doctorRouter from "./routes/doctor.route.js";
import userRouter from "./routes/user.route.js";

//app config

const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middlewares


app.use(express.json());
app.use(
  cors({
    origin: [/localhost:5173$/, /localhost:5174$/,/doc-ease-backend.vercel.app$/],
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
