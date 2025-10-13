import jwt from "jsonwebtoken";

const authUser=async(req,res,next)=>{
    try {
        const {usertoken}=req.headers;
        if(!usertoken){
            return res.json({
                success:false,
                message:"Token is required"
            })
        }
        const decodedId=jwt.verify(usertoken,process.env.JWT_SECRET);

        req.userId=decodedId.id;
        next()


    } catch (error) {
        return res.json({
            success:false,
            message:error.message
        })
        
    }
}

export {authUser}