import jwt from "jsonwebtoken";

//admin authentication middleware

const authAdmin = async (req, res, next) => {
  try {
    //logic to verify token..
    console.log(req.headers);
    const {admintoken}=req.headers
    if(!admintoken){
      console.log(admintoken);
        return res.json({
            success:false,
            message:admintoken
        })
    }

    const decodeToken=jwt.verify(admintoken,process.env.JWT_SECRET)

    if(decodeToken !==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
        return res.json({
            success:false,
            message:'Not authorized Login Again'
        })
    }

    next();
  } catch (error) {
    res.json({
      success: "false",
      message: error.message,
    });
  }
};

export default authAdmin