import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail: string, otp: string, itemName: string) {
  console.log(`\n=================================================`);
  console.log(`🔑 [2FA OTP VERIFICATION]`);
  console.log(`Target Email : ${toEmail}`);
  console.log(`Item Name    : "${itemName}"`);
  console.log(`OTP Code     : ${otp}`);
  console.log(`Expires In   : 10 minutes`);
  console.log(`=================================================\n`);

  // Check if SMTP options are provided in environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Campus Lost & Found" <${smtpUser}>`,
        to: toEmail,
        subject: `🔐 Your Verification Code: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-radius: 10px;">
            <h2 style="color: #2563eb; text-align: center;">Campus Lost & Found</h2>
            <h3 style="color: #333333;">Item Report Verification</h3>
            <p style="color: #555555; line-height: 1.5;">
              You are attempting to report the item: <strong>"${itemName}"</strong>.
            </p>
            <p style="color: #555555;">Please enter the following 6-digit OTP code to confirm your submission:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #1d4ed8; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #888888; font-size: 12px; text-align: center;">
              This code will expire in 10 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });

      console.log(`✅ OTP email successfully dispatched via SMTP to ${toEmail}`);
    } catch (error) {
      console.error("⚠️ SMTP email sending error:", error);
    }
  } else {
    console.log(`ℹ️ SMTP credentials not configured in .env.local. OTP logged above for testing.`);
  }
}
