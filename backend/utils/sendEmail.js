import nodemailer from "nodemailer";

const sendEmail = async (to, link) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // example@gmail.com
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // Verify transporter (important for prod debugging)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Docease Support" <${process.env.EMAIL_USER}>`, // MUST be same as auth user
      to,
      subject: "Reset Your Password",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click the link below:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

export default sendEmail;
