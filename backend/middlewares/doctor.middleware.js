
import jwt from "jsonwebtoken"
const authDoctor=async(req,res,next)=>{
    try {
        //logic to verify the doctor..
        const {doctortoken}=req.headers;
        if(!doctortoken){
            return res.json({
                success:false,
                message:"Token is required",
            })
        }

        const decodeId=jwt.verify(doctortoken,process.env.JWT_SECRET);

        req.doctorId=decodeId.id;
        next();
    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
    }
}

export {authDoctor}