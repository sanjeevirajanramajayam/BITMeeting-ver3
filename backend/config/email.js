const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

module.exports = transporter;
