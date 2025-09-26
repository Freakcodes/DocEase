import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log('DB connected successfully'));
        await mongoose.connect(`${process.env.MONGODB_URI}/docease`);
    }catch(err)
    {
        console.log(err);
    }
    
}

export default connectDB;