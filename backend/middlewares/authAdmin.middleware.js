import jwt from "jsonwebtoken";

//admin authentication middleware

const authAdmin = async (req, res, next) => {
  try {
    //logic to verify token..
    const {adminToken}=req.headers
    if(!adminToken){
        return res.json({
            success:false,
            message:'Not authorized Login Again'
        })
    }

    const decodeToken=jwt.verify(adminToken,process.env.JWT_SECRET)

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