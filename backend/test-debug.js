
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require("nodemailer");

async function testEmail() {
    console.log("Testing SMTP Config with debug logging...");

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true
    });

    try {
        console.log("Verifying transporter connection...");
        await transporter.verify();
        console.log("Transporter verification successful!");

        console.log("Attempting to send test email...");
        let info = await transporter.sendMail({
            from: `"EventASAP Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: "Test Email from Debug Script (Debug Mode)",
            text: "If you receive this, email sending is working with debug mode!",
        });

        console.log("Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
}

testEmail();
