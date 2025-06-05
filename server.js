

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// POST endpoint to send emails
app.post('/send-franchise-details', (req, res) => {
  const { name, address, district, state, email, phone } = req.body;

  if (!name || !address || !district || !state || !email || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  const pdfPath = path.resolve(__dirname, 'RocketCarwashFranchise.pdf');

  if (!fs.existsSync(pdfPath)) {
    return res.status(500).json({ message: 'Attachment file not found' });
  }

  const userMailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Thank you for your interest in Rocket Carwash Franchise',
    text: `Dear ${name},\n\nThank you for your interest in our franchise. Please find attached our franchise details.\n\nBest regards,\nRocket Carwash Team`,
    attachments: [{ filename: 'RocketCarwashFranchise.pdf', path: pdfPath }],
  };

  const adminMailOptions = {
    from: process.env.GMAIL_USER,
    to: 'rocketcarwashsocialmedia@gmail.com',
    subject: 'New Franchise Application Received',
    text: `New Franchise Application Received\n\nName: ${name}\nAddress: ${address}\nDistrict: ${district}\nState: ${state}\nEmail: ${email}\nPhone: ${phone}`,
  };

  transporter.sendMail(userMailOptions, (error, info) => {
    if (error) {
      console.error('Failed to send user email:', error);
      return res.status(500).json({ message: 'An error occurred while sending the email. Please try again later.' });
    }
    console.log('User email sent:', info.response);

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send admin email:', error);
        return res.status(500).json({ message: 'An error occurred while notifying the admin.' });
      }
      console.log('Admin email sent:', info.response);
      res.status(200).json({ message: 'Emails sent successfully' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
