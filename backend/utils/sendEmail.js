import nodemailer from "nodemailer";

// Create transporter once — reused across all email types
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────

const templates = {
  // 1. Password reset (your existing one — unchanged)
  resetPassword: (link) => ({
    subject: "Reset Your Password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1f2937;">Reset Your Password</h2>
        <p style="color:#4b5563;">You requested to reset your password. Click the button below:</p>
        <a href="${link}" 
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `,
  }),

  // 2. Appointment booked — payment already done (online)
  appointmentConfirmed: ({
    patientName,
    doctorName,
    doctorSpeciality,
    slotDate,
    slotTime,
    fees,
  }) => ({
    subject: "Appointment Confirmed ✅",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#16a34a;">Your Appointment is Confirmed!</h2>
        <p style="color:#374151;">Hi <strong>${patientName}</strong>, your appointment has been successfully booked and payment received.</p>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <h3 style="margin:0 0 12px;color:#15803d;">Appointment Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Doctor</td><td style="color:#111827;font-weight:600;">Dr. ${doctorName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Speciality</td><td style="color:#111827;">${doctorSpeciality}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="color:#111827;">${slotDate}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="color:#111827;">${slotTime}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Fees</td><td style="color:#111827;">₹${fees}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Payment</td><td style="color:#16a34a;font-weight:600;">✅ Paid</td></tr>
          </table>
        </div>

        <p style="color:#6b7280;font-size:13px;">Please arrive 10 minutes before your scheduled time. See you soon!</p>
      </div>
    `,
  }),

  // 3. Payment completed — full confirmation + Add to Calendar buttons
  paymentSuccess: ({
    patientName,
    doctorName,
    doctorSpeciality,
    slotDate,
    slotTime,
    fees,
    appointmentId,
    transactionId,
  }) => {
    // ── Build calendar links ──────────────────────────────────────────────────
    // slotDate expected as "DD_MM_YYYY" (your existing format e.g. "25_12_2025")
    // slotTime expected as "10:00 am" or "10:00 AM"

    // ── Parse slotDate — handles all formats your DB might store ──
    // "25_12_2025" (DD_MM_YYYY)  |  "25-12-2025"  |  "2025-12-25" (ISO)  |  timestamp number
    let day, month, year;

    if (typeof slotDate === "number" || /^\d{10,13}$/.test(String(slotDate))) {
      // Unix timestamp in ms or seconds
      const ts = new Date(
        Number(slotDate) < 1e12 ? Number(slotDate) * 1000 : Number(slotDate),
      );
      day = ts.getDate();
      month = ts.getMonth() + 1;
      year = ts.getFullYear();
    } else if (typeof slotDate === "string") {
      const parts = slotDate.split(/[_\-\/]/).map(Number);
      if (parts[0] > 31) {
        [year, month, day] = parts;
      } // YYYY-MM-DD
      else {
        [day, month, year] = parts;
      } // DD_MM_YYYY
    } else {
      const d = new Date(slotDate);
      day = d.getDate();
      month = d.getMonth() + 1;
      year = d.getFullYear();
    }

    // ── Parse slotTime — handles "10:00 am", "10:00 AM", "14:30" (24h) ──
    let hours = 9,
      minutes = 0; // sensible fallback
    if (slotTime) {
      const timeStr = String(slotTime).trim().toUpperCase();
      const [timePart, meridiem] = timeStr.split(" ");
      hours = parseInt(timePart.split(":")[0], 10) || 9;
      minutes = parseInt(timePart.split(":")[1], 10) || 0;
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
    }

    // Build Date objects — 30-min appointment duration
    const start = new Date(year, month - 1, day, hours, minutes);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    // If date is still invalid, skip calendar links gracefully
    const calendarValid = !isNaN(start.getTime());

    // All calendar variables — only computed when date is valid
    let googleLink = null,
      icsDataUri = null,
      outlookLink = null;

    if (calendarValid) {
      // Format to YYYYMMDDTHHMMSS (no Z — keeps it timezone-neutral)
      const fmt = (d) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

      const startFmt = fmt(start);
      const endFmt = fmt(end);

      const title = encodeURIComponent(
        `Doctor Appointment — Dr. ${doctorName}`,
      );
      const details =
        encodeURIComponent(`Appointment with Dr. ${doctorName} (${doctorSpeciality})
Appointment ID: ${appointmentId}`);
      const location = encodeURIComponent("Clinic");

      // Google Calendar
      googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFmt}/${endFmt}&details=${details}&location=${location}`;

      // iCal (Apple Calendar + Outlook desktop)
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DocEase//Appointment//EN",
        "BEGIN:VEVENT",
        `UID:${appointmentId}@docease`,
        `DTSTAMP:${startFmt}`,
        `DTSTART:${startFmt}`,
        `DTEND:${endFmt}`,
        `SUMMARY:Doctor Appointment — Dr. ${doctorName}`,
        `DESCRIPTION:Appointment with Dr. ${doctorName} (${doctorSpeciality})\nAppointment ID: ${appointmentId}`,
        "LOCATION:Clinic",
        "BEGIN:VALARM",
        "TRIGGER:-PT60M",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: Doctor appointment in 1 hour",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("");

      const icsBase64 = Buffer.from(icsContent).toString("base64");
      icsDataUri = `data:text/calendar;base64,${icsBase64}`;

      // Outlook web
      outlookLink = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${details}&location=${location}`;
    }

    return {
      subject: "Payment Successful — Appointment Confirmed 🎉",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">

          <h2 style="color:#16a34a;margin-bottom:4px;">Payment Successful! 🎉</h2>
          <p style="color:#374151;margin-top:0;">Hi <strong>${patientName}</strong>, your payment has been received and your appointment is now confirmed.</p>

          <!-- Appointment Details -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
            <h3 style="margin:0 0 12px;color:#15803d;">Appointment Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6b7280;width:150px;">Doctor</td><td style="color:#111827;font-weight:600;">Dr. ${doctorName}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Speciality</td><td style="color:#111827;">${doctorSpeciality}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="color:#111827;font-weight:600;">${slotDate.toString().replace(/[_\-\/]/g, " / ")}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="color:#111827;font-weight:600;">${slotTime}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Fees Paid</td><td style="color:#111827;">₹${fees}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Status</td><td style="color:#16a34a;font-weight:700;">✅ Confirmed</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Appointment ID</td><td style="color:#6b7280;font-size:12px;">${appointmentId}</td></tr>
              ${transactionId ? `<tr><td style="padding:6px 0;color:#6b7280;">Transaction ID</td><td style="color:#6b7280;font-size:12px;">${transactionId}</td></tr>` : ""}
            </table>
          </div>

          <!-- Add to Calendar Section — only shown if date parsed correctly -->
          ${
            calendarValid
              ? `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
            <h3 style="margin:0 0 8px;color:#1e293b;font-size:15px;">📅 Don't miss your appointment!</h3>
            <p style="color:#64748b;font-size:13px;margin:0 0 14px;">Add it to your calendar so you get a reminder:</p>

            <a href="${googleLink}" target="_blank"
               style="display:inline-block;margin:0 8px 10px 0;padding:10px 18px;background:#4285F4;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:bold;">
              📅 Add to Google Calendar
            </a>

            <a href="${icsDataUri}" download="appointment.ics"
               style="display:inline-block;margin:0 8px 10px 0;padding:10px 18px;background:#1c1c1e;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:bold;">
               Add to Apple Calendar
            </a>

            <a href="${outlookLink}" target="_blank"
               style="display:inline-block;margin:0 8px 10px 0;padding:10px 18px;background:#0078D4;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:bold;">
              📆 Add to Outlook
            </a>

            <p style="color:#94a3b8;font-size:11px;margin:10px 0 0;">
              A reminder will be sent 1 hour before your appointment (Apple &amp; Outlook).
            </p>
          </div>
          `
              : ""
          }

          <p style="color:#6b7280;font-size:13px;margin-top:20px;">
            Please arrive <strong>10 minutes early</strong>. Carry any previous prescriptions or reports if available.
          </p>
          <p style="color:#9ca3af;font-size:12px;">If you have any questions, reply to this email or contact the clinic directly.</p>

        </div>
      `,
    };
  },

  // 4. Appointment booked — payment still pending (offline), with Pay Online button
  appointmentPendingPayment: ({
    patientName,
    doctorName,
    doctorSpeciality,
    slotDate,
    slotTime,
    fees,
    paymentLink,
    appointmentId,
  }) => ({
    subject: "Appointment Booked — Payment Pending ⏳",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#d97706;">Appointment Booked — Payment Pending</h2>
        <p style="color:#374151;">Hi <strong>${patientName}</strong>, your appointment has been booked successfully. However, your payment is still pending.</p>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
          <h3 style="margin:0 0 12px;color:#b45309;">Appointment Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Doctor</td><td style="color:#111827;font-weight:600;">Dr. ${doctorName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Speciality</td><td style="color:#111827;">${doctorSpeciality}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="color:#111827;">${slotDate}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="color:#111827;">${slotTime}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Fees</td><td style="color:#111827;">₹${fees}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Payment</td><td style="color:#dc2626;font-weight:600;">⏳ Pending</td></tr>
          </table>
        </div>

        <p style="color:#374151;">Please complete your payment to confirm the appointment:</p>

        <a href="${paymentLink}" 
           style="display:inline-block;margin:8px 0 20px;padding:12px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">
          💳 Pay Online Now
        </a>

        <p style="color:#6b7280;font-size:12px;">
          Appointment ID: <strong>${appointmentId}</strong><br/>
          If you have already paid offline, please ignore this email. 
          Your appointment will be confirmed by the clinic staff.
        </p>
      </div>
    `,
  }),

  consultationComplete: ({
    patientName,
    doctorName,
    doctorSpeciality,
    slotDate,
    slotTime,
    pdfLink,
  }) => ({
    subject: "Your Consultation Is Done",
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#16a34a;">Consultation Completed ✅</h2>
      
      <p style="color:#374151;">
        Hi <strong>${patientName}</strong>, your consultation with Dr. ${doctorName}
        ${doctorSpeciality ? ` (${doctorSpeciality})` : ""} 
        on ${slotDate} at ${slotTime} has been completed.
      </p>

      <p style="color:#374151;">
        You can download your consultation summary using the link below:
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <a href="${pdfLink}" 
           style="display:inline-block;padding:10px 16px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">
          📄 Download Consultation Summary
        </a>
      </div>

      <p style="color:#6b7280;font-size:13px;">
        If you have any follow-up questions, feel free to reply to this email or contact the clinic.
      </p>
    </div>
  `,
  }),
};

// ─────────────────────────────────────────────
// MAIN sendEmail FUNCTION
// type: "resetPassword" | "appointmentConfirmed" | "paymentSuccess" | "appointmentPendingPayment"
// data: object with required fields for each type
// ─────────────────────────────────────────────

const sendEmail = async (to, type, data) => {
  const template = templates[type];

  if (!template) {
    throw new Error(
      `Unknown email type: "${type}". Valid types: ${Object.keys(templates).join(", ")}`,
    );
  }

  const { subject, html } = template(data);

  await transporter.sendMail({
    from: `"DocEase Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
