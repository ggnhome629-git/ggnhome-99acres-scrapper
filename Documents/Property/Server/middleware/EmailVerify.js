const nodemailer = require('nodemailer');

// Function to send email (OTP or verification email)
const sendEmail = async (to, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',  // Use Gmail's email service
    auth: {
      user: process.env.EMAIL_USER,  // Use environment variable for email
      pass: process.env.EMAIL_PASS   // Use environment variable for app password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,    // Sender's email address from environment
    to: to,                         // Recipient's email address
    subject: subject,               // Subject of the email
    text: text                      // Email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

module.exports = sendEmail;