require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

async function testMail() {
  try {
    console.log('Testing auth for:', process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: '"BudgetX Test" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER, // sending it to themselves!
      subject: 'Test Email System',
      text: 'If you see this, your App Password worked correctly!'
    });

    console.log('✅ Email sent successfully:', info.messageId);
  } catch (err) {
    console.error('❌ Email sending failed:');
    console.error(err);
  }
}

testMail();
