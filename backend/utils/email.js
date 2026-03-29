const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 2. Define email options
  const mailOptions = {
    from: `BudgetX <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

// HTML template generator for Welcome Email
const welcomeEmailTemplate = (name, frontendUrl) => `
<div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0;">
  <div style="background: linear-gradient(135deg, #FF6B00, #FF8C00); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">BudgetX</h1>
  </div>
  <div style="padding: 40px 30px;">
    <h2 style="color: #333; font-size: 24px;">Hey ${name}, welcome to BudgetX! 🎉</h2>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">You're all set! It's time to track, convert, and save smarter.</p>
    
    <div style="margin: 30px 0;">
      <h3 style="color: #FF6B00; font-size: 18px;">What you can do now:</h3>
      <ul style="color: #555; line-height: 1.8; font-size: 16px;">
        <li>🔄 Convert currencies in real-time</li>
        <li>💸 Track your daily expenses effortlessly</li>
        <li>📊 Monitor category budgets with smart alerts</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <a href="${frontendUrl}/index.html" style="background: linear-gradient(135deg, #FF6B00, #FF8C00); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Open My Dashboard</a>
    </div>
  </div>
  <div style="background-color: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #eee;">
    <p style="color: #888; font-size: 12px; margin: 0;">© 2026 BudgetX by You. All rights reserved.</p>
    <p style="color: #aaa; font-size: 11px;">You received this because you signed up for BudgetX.</p>
  </div>
</div>
`;

module.exports = {
  sendEmail,
  welcomeEmailTemplate
};
