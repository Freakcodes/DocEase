import doctorModel from "../models/doctor.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointment.model.js";
import { v2 as cloudinary } from "cloudinary";

const toggleAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
  }
};

const listAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-email,-password"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api for doctor login..

const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.json({
        success: false,
        message: "Doctor doesn't exist",
      });
    }
    const hashedPassword = doctor.password;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);

    return res.json({
      success: true,
      token,
      doctor,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//api for getting all appointments of the doctor..
const getAppointments = async (req, res) => {
  try {
    const doctorId = req.doctorId;
    if (!doctorId) {
      return res.json({
        success: false,
        message: "Please Login First",
      });
    }

    const today = new Date();

    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const appointments = await appointmentModel.find({
      docId: doctorId,
      slotDate: formattedDate,
    });
   

    return res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//api to mark appointment completed
const markCompleteAppointment = async (req, res) => {
  try {
    const docId = req.doctorId;

    const { appointmentId, notes, medicines, tests, followUpDate } = req.body;

    // find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    // validation
    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.docId !== docId) {
      return res.json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Already completed",
      });
    }

    // update
    appointment.isCompleted = true;
    appointment.completedAt = new Date();

    appointment.doctorNotes = {
      notes,
      medicines,
      tests,
      followUpDate,
      createdAt: new Date(),
    };

    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment completed successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
//api to get the dashboard data

const dashboardData = async (req, res) => {
  try {
    const docId = req.doctorId;

    const appointments = await appointmentModel.find({ docId });

    // filter out cancelled appointments
    const validAppointments = appointments.filter(
      (apt) => !apt.isCancelled
    );

    // calculate total earnings
    let earnings = 0;
    validAppointments.forEach((apt) => {
      if (apt.isCompleted && apt.payment) {
        earnings += apt.amount;
      }
    });

    // unique patients
    let patients = [];
    validAppointments.forEach((apt) => {
      if (!patients.includes(apt.userId)) {
        patients.push(apt.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: validAppointments.length, 
      patients: patients.length,
      latestAppointments: validAppointments.reverse().slice(0, 5),
    };

    res.json({
      success: true,
      dashData,
    });
  } catch (error) {
    return res.json({
      success: false,
      data: error.message,
    });
  }
};

//api to get the doctor profile data

const getDoctorProfile = async (req, res) => {
  try {
    const docId = req.doctorId;
    const doctor = await doctorModel.findById(docId).select("-password");

    return res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//api to update the doctor profile data

const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doctorId;
    const imageFile = req.file;

    const {
      name,
      email,
      speciality,
      degree,
      experience,
      fees,
      about,
      address,

      // ✅ NEW FIELDS
      startTime,
      endTime,
      slotDuration,
      availableDays,
    } = req.body;

    // ✅ validation
    if (
      !name ||
      !email ||
      !speciality ||
      !degree ||
      !experience ||
      !fees ||
      !about ||
      !address ||
      !startTime ||
      !endTime
    ) {
      return res.json({
        success: false,
        message: "Data Fields Missing",
      });
    }

    // ✅ build update object
    const updateData = {
      name,
      email,
      speciality,
      degree,
      experience,
      fees,
      about,
      address: JSON.parse(address),

      // ✅ NEW: timings
      timings: {
        start: startTime,
        end: endTime,
      },

      // ✅ NEW: slot duration
      slotDuration: slotDuration || 30,

      // ✅ NEW: available days
      availableDays: availableDays
        ? JSON.parse(availableDays)
        : ["MON", "TUE", "WED", "THU", "FRI"],
    };

    // ✅ update doctor
    await doctorModel.findByIdAndUpdate(docId, updateData);

    // ✅ update image (if exists)
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      await doctorModel.findByIdAndUpdate(docId, {
        image: imageUpload.secure_url,
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
export {
  toggleAvailability,
  listAllDoctors,
  doctorLogin,
  getAppointments,
  markCompleteAppointment,
  dashboardData,
  getDoctorProfile,
  updateDoctorProfile,
};
