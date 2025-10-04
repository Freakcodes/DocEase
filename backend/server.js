import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/admin.route.js';


//app config

const app=express();
const port=process.env.PORT||4000
connectDB();
connectCloudinary();

//middlewares

app.use(express.json());
    app.use(cors({
        origin:'http://localhost:5174',
    }));


//api endpoints
app.use('/api/admin',adminRouter)
app.get('/',(req,res)=>{
    res.send('API WORKING FINE');
})


app.listen(port,()=>{
    console.log('server started',port);
    
})