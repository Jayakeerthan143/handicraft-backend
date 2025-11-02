const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.EMAIL_FROM_NAME || "Handicraft Marketplace"} <${
      process.env.EMAIL_USER
    }>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
