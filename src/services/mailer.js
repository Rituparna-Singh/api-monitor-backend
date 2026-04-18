const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendDownAlert = async (monitor, userEmail) => {
  try {
    await transporter.sendMail({
      from: `"API Monitor" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🚨 ${monitor.name} is DOWN`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">🚨 Monitor Alert</h2>
          <p>Your monitor <strong>${monitor.name}</strong> is currently down.</p>
          <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Monitor:</strong> ${monitor.name}</p>
            <p style="margin: 8px 0 0;"><strong>URL:</strong> ${monitor.url}</p>
            <p style="margin: 8px 0 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #6B7280;">We'll notify you when it recovers.</p>
        </div>
      `,
    });
    console.log(`📧 Down alert sent for ${monitor.name}`);
  } catch (err) {
    console.error("Failed to send down alert:", err.message);
  }
};

const sendRecoveryAlert = async (monitor, userEmail) => {
  try {
    await transporter.sendMail({
      from: `"API Monitor" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ ${monitor.name} is back UP`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">✅ Monitor Recovered</h2>
          <p>Your monitor <strong>${monitor.name}</strong> is back online.</p>
          <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Monitor:</strong> ${monitor.name}</p>
            <p style="margin: 8px 0 0;"><strong>URL:</strong> ${monitor.url}</p>
            <p style="margin: 8px 0 0;"><strong>Recovered at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });
    console.log(`📧 Recovery alert sent for ${monitor.name}`);
  } catch (err) {
    console.error("Failed to send recovery alert:", err.message);
  }
};

module.exports = { sendDownAlert, sendRecoveryAlert };