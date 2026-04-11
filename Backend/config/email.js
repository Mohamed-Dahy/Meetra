// backend/config/email.js
const { Resend } = require("resend");

// Initialize Resend client with API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);


async function sendEmail(to, subject, html) {
  try {
    const response = await resend.emails.send({
        from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent:", response.id);
    return response;
  } catch (err) {
    console.error("Email failed:", err);
    throw err;
  }
}


function analysisReadyEmail(meetingTitle) {
  return `
 <div style="background-color:#1e1e2f;color:#ffffff;font-family:Arial,Helvetica,sans-serif;padding:30px;">
  
  <h2 style="color:#a855f7;margin-bottom:20px;font-weight:600;">
    New Meeting Available
  </h2>

  <p style="font-size:15px;line-height:1.6;margin-bottom:15px;">
    We are pleased to inform you that you are invited to a new meeting titled <strong>${meetingTitle}</strong>.
  </p> 

  <p style="font-size:15px;line-height:1.6;margin-bottom:25px;">
    Please log in to your Meetra dashboard to view the meeting details and confirm your attendance.
  </p>

  <hr style="border:none;border-top:1px solid #333;margin:25px 0;" />

  <p style="font-size:12px;color:#aaaaaa;margin:0;">
    This is an automated message. Please do not reply to this email.
  </p>
  

  <p style="margin-top:10px;font-size:12px;color:#aaaaaa;">
    © ${new Date().getFullYear()} Meetra. All rights reserved.
  </p>

</div>
  `;
}


function welcomeEmail(userName) {
  return `
  <div style="background-color:#1e1e2f;color:#fff;font-family:sans-serif;padding:20px;">
    <h2 style="color:#a855f7;">Welcome to Meetra, ${userName}!</h2>
    <p>We’re excited to have you onboard. Start creating and managing meetings with AI-powered features.</p>
    <a href="#" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#a855f7;color:#fff;text-decoration:none;border-radius:5px;">Go to Dashboard</a>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">Meetra &copy; ${new Date().getFullYear()}</p>
  </div>
  `;
}

// Export the send function and templates
module.exports = {
  sendEmail,
  analysisReadyEmail,
  welcomeEmail,
};