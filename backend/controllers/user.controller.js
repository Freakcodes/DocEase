import userModel from "../models/user.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name);
  if (!validator.isEmail(email)) {
    res.json({ success: false, message: "Enter a valid email" });
  }

  if (password.length < 8) {
    return res.json({
      success: false,
      message: "password must be 8 character long",
    });
  }

  const salt = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userData = {
    name,
    email,
    password: hashedPassword,
  };

  const newUser = new userModel(userData);

  const user = await newUser.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token,user });
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //simple steps
  //check if email exists in the mongoDB
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token,user });
    }
  } catch (error) {
    return res.json({success:false,error})
  }
};

const userProfile=async(req,res)=>{
  const user=await userModel.findById(req.userId).select('-password');
  if(!user)return res.json({success:false,message:'User not found'});
  res.json({success: true,user})
}
export { registerUser, loginUser,userProfile };
