import nodemailer from "nodemailer";

const sendEmail = async (to, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "Support "+process.env.EMAIL_USER,
    to,
    subject: "Reset Your Password",
    html: `
      <p>You requested to reset your password.</p>
      <p>Click the link below:</p>
      <a href="${link}">${link}</a>
      <p>This link will expire soon.</p>
    `,
  });
};


export default sendEmail