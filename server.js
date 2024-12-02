// const express = require('express');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // Nodemailer transporter setup
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'mathaniyappan2023@gmail.com',
//     pass: 'bbta vcpv veok fsaf',
//   },
// });

// // Existing POST endpoint
// app.post('/send-email', (req, res) => {
//   const { userEmail } = req.body;

//   const mailOptions = {
//     from: 'mathaniyappan2023@gmail.com',
//     to: 'mathan.uiuxdesigner@gmail.com',
//     subject: 'Contact Request from ChatBot',
//     text: `You have a new contact request. The user's email is: ${userEmail}.`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log('Error:', error);
//       return res.status(500).json({ message: 'Failed to send email' });
//     }
//     console.log('Email sent:', info.response);
//     res.status(200).json({ message: 'Email sent successfully' });
//   });
// });

// // New POST endpoint to handle PDF and additional user data
// app.post('/send-franchise-details', (req, res) => {
//   const { name, address, district, state, email, phone } = req.body;

//   // Path to PDF file
//   const pdfPath = path.join(__dirname, 'RocketCarwashFranchise.pdf');

//   // Mail to the user
//   const userMailOptions = {
//     from: 'mathaniyappan2023@gmail.com',
//     to: email,
//     subject: 'Thank you for your interest in Rocket Carwash Franchise',
//     text: `Dear ${name},\n\nThank you for your interest in our franchise. Please find attached our franchise details.\n\nBest regards,\nRocket Carwash Team`,
//     attachments: [
//       {
//         filename: 'RocketCarwashFranchise.pdf',
//         path: pdfPath,
//       },
//     ],
//   };

//   // Mail to the admin
//   const adminMailOptions = {
//     from: 'mathaniyappan2023@gmail.com',
//     to: 'mathan.uiuxdesigner@gmail.com',
//     subject: 'New Franchise Application Received',
//     text: `New Franchise Application Details:\n\nName: ${name}\nAddress: ${address}\nDistrict: ${district}\nState: ${state}\nEmail: ${email}\nPhone: ${phone}`,
//   };

//   // Send emails
//   transporter.sendMail(userMailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending to user:', error);
//       return res.status(500).json({ message: 'Failed to send email to user' });
//     }
//     console.log('Email sent to user:', info.response);

//     transporter.sendMail(adminMailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending to admin:', error);
//         return res.status(500).json({ message: 'Failed to send email to admin' });
//       }
//       console.log('Email sent to admin:', info.response);
//       res.status(200).json({ message: 'Emails sent successfully' });
//     });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

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
    to: 'mathan.uiuxdesigner@gmail.com',
    subject: 'New Franchise Application Received',
    text: `New Franchise Application Details:\n\nName: ${name}\nAddress: ${address}\nDistrict: ${district}\nState: ${state}\nEmail: ${email}\nPhone: ${phone}`,
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
