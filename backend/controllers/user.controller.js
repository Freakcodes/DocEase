import userModel from "../models/user.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.model.js";
import appointmentModel from "../models/appointment.model.js";
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
  res.json({ success: true, token, user });
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
      return res.json({ success: true, token, user });
    }
  } catch (error) {
    return res.json({ success: false, error });
  }
};

const userProfile = async (req, res) => {
  const user = await userModel.findById(req.userId).select("-password");
  if (!user) return res.json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

const updateUserProfile = async (req, res) => {
  const { name, email, phone, gender, dob, address } = req.body;

  const imageFile = req.file;
  if (!name || !phone || !dob || !gender) {
    return res.json({ success: false, message: "Data Fields Missing" });
  }
  //TODO: basic checks..
  //upload image to cloudinary..

  const updatedUser = await userModel.findByIdAndUpdate(req.userId, {
    name,
    email,
    phone,
    gender,
    dob,
    address: JSON.parse(address),
  });
  if (imageFile) {
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    await userModel.findByIdAndUpdate(req.userId, { image: imageUrl });
  }
  res.json({ success: true, message: "Profile Updated" });
};

//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    let slots_booked = docData.slots_booked;
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slots not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });

    //checking for slot availability
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error,
      
    });
  }
};

//API to get all appointments
const listAllAppointments = async (req, res) => {
  try {
    const userId=req.userId;
    const appointments=await appointmentModel.find({userId});
    return res.json({
    success:true,
    appointments
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};

//API to cancel the appointments
const cancelAppointments=async(req,res)=>{
  try {
    const {appointmentId}=req.body;
    const userId=req.userId;
    const appointmentData=await appointmentModel.findById(appointmentId);
    
    if(appointmentData.userId!=userId){
      return res.json({success:false,message:'Unauthorized access'});
    }

    await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true});

    //releasing the doctor slot

    const {docId,slotDate,slotTime}=appointmentData

    const doctorData=await doctorModel.findById(docId);
    let slots_booked=doctorData.slots_booked;
    slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)

    await doctorModel.findByIdAndUpdate(docId,{slots_booked});

    res.json({success:true})
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
}
export {
  registerUser,
  loginUser,
  userProfile,
  updateUserProfile,
  bookAppointment,
  listAllAppointments,
  cancelAppointments
};
