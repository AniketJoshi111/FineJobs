
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,  //gmail
  auth: {
    user: process.env.EMAIL_USER,     //from here email will be sent
    pass: process.env.EMAIL_PASS      // password for that email
  }
});

module.exports = transporter;