const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'Khalid.cse.pust@gmail.com',
      pass: process.env.SMTP_PASS || 'ampygfffixqwhbmf',
    },
  });
};

const sendOtpEmail = async (toEmail, otp) => {
  const appName = process.env.APP_NAME || 'Shadhinota hall PUST';
  const transporter = getTransporter();

  const mailOptions = {
    from: `"${appName}" <${process.env.SMTP_USER || 'Khalid.cse.pust@gmail.com'}>`,
    to: toEmail,
    subject: `Your Verification Code: ${otp} - ${appName}`,
    text: `Your 6-digit verification code is: ${otp}\n\nThis code is valid for 10 minutes. Please enter this code to verify your email.\n\nThank you,\n${appName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; rounded: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #4338ca; margin: 0 0 5px 0;">${appName}</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Hall Seat & Residency Management Portal</p>
        </div>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 10px 0;">Your 6-digit email verification code is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e1b4b; background: #ffffff; padding: 12px 20px; display: inline-block; border-radius: 6px; border: 2px dashed #6366f1;">
            ${otp}
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 12px 0 0 0;">This code will expire in 10 minutes.</p>
        </div>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          If you did not request this verification code, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendStudentApprovalEmail = async (toEmail, roomNumber) => {
  const appName = process.env.APP_NAME || 'Shadhinota hall PUST';
  const transporter = getTransporter();

  const exactMessage = `Congratulation, you are a member of shwadhinota hall, you room number is ${roomNumber}, now you canlogin.`;

  const mailOptions = {
    from: `"${appName}" <${process.env.SMTP_USER || 'Khalid.cse.pust@gmail.com'}>`,
    to: toEmail,
    subject: `Approval Notice - ${appName}`,
    text: exactMessage,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #047857; margin: 0 0 5px 0;">${appName}</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Student Hall Membership Approved</p>
        </div>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="color: #065f46; font-size: 18px; font-weight: bold; margin-bottom: 12px;">
            🎉 Congratulations!
          </div>
          <p style="color: #047857; font-size: 16px; font-weight: 600; line-height: 1.6; margin: 0;">
            ${exactMessage}
          </p>
        </div>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="color: #6b7280; padding: 6px 0;">Allocated Room:</td>
              <td style="color: #111827; font-weight: bold; text-align: right; padding: 6px 0;">${roomNumber}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 6px 0;">Account Status:</td>
              <td style="color: #059669; font-weight: bold; text-align: right; padding: 6px 0;">Active / Approved</td>
            </tr>
          </table>
        </div>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          You can now login to your hall management portal using your registered email and password or via OTP verification.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendStaffApprovalEmail = async (toEmail, name) => {
  const appName = process.env.APP_NAME || 'Shadhinota hall PUST';
  const transporter = getTransporter();

  const message = `Congratulation ${name || 'Staff Member'}, your staff account for Shadhinota hall PUST has been approved by admin. Now you can login.`;

  const mailOptions = {
    from: `"${appName}" <${process.env.SMTP_USER || 'Khalid.cse.pust@gmail.com'}>`,
    to: toEmail,
    subject: `Staff Account Approved - ${appName}`,
    text: message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #0f766e; margin: 0 0 5px 0;">${appName}</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Staff Portal</p>
        </div>
        <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="color: #115e59; font-size: 18px; font-weight: bold; margin-bottom: 12px;">
            Staff Account Approved
          </div>
          <p style="color: #0f766e; font-size: 15px; line-height: 1.6; margin: 0;">
            ${message}
          </p>
        </div>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
          You can now login to manage student problems, residency approvals, and maintenance requests.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtpEmail,
  sendStudentApprovalEmail,
  sendStaffApprovalEmail,
};
