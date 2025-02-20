const nodemailer = require('nodemailer');
const sendMessage = async(email, subject, message) => {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.gmail,
            pass: process.env.password
        }
    });
    // Email details
    const mailOptions = {
        from: process.env.gmail,
        to: email,
        subject:subject,
        html: message
    };
    // Send the email
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}
module.exports = {
   sendMessage
}