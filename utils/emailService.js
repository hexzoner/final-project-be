import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
});

async function sendEmail(from, to, subject, text) {
  const mailOptions = {
    from, 
    to,
    subject,
    text,
  };

  // Send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);
  return info;
}

export default sendEmail;

// setup for using Mailgun

// import Mailgun from 'mailgun.js';
// import formData from 'form-data';

// // Initialize Mailgun client
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({
//   username: 'api',
//   key: process.env.MAILGUN_API_KEY,
// });

// async function sendEmail(to, subject, text) {
//   try {
//     const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       text,
//     });
//     return response;
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw error;
//   }
// }

// export default sendEmail;
