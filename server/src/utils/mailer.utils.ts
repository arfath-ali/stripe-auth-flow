import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.trim().replace(/\s+/g, ''),
  },
  family: 4,
  connectionTimeout: 45000,
  greetingTimeout: 45000,
  socketTimeout: 45000,
  tls: {
    rejectUnauthorized: false,
  },
} as nodemailer.TransportOptions);

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: `Stripe <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your Stripe account',
      html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: 500; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        
        <h2 style="font-size: 26px; font-weight: 700; line-height: 1.25; letter-spacing: -0.48px; color: #6a4ff7;">
          stripe
        </h2>
        
        <p>Hello,</p>
        
        <p>
          Please use the verification code below to confirm your email address:
          <a href="mailto:${email}">${email}</a>.
        </p>
        
        <div style="text-align: center; margin: 24px auto;">
          <span style="display: inline-block; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #6a4ff7;">
            ${otp}
          </span>
        </div>
        
        <p>
          This code will expire in 5 minutes. Do not share this code with anyone.
        </p>
        
        <p>
          If you didn’t create this account, you can safely ignore this email.
        </p>
        
        <p>— The Stripe team</p>
      
      </div>
      `,
    });
  } catch (err) {
    console.error(
      `[Mailer Error] Failed to send verification email to ${email}:`,
      err,
    );
    throw err;
  }
}

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  try {
    await transporter.sendMail({
      from: `Stripe <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset you Stripe password',
      html: `
     <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: 500; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 26px; font-weight: 700; line-height: 1.25; letter-spacing: -0.48px; color: #6a4ff7;">stripe</h2>
        
        <p>Hello,</p>
        
        <p>We received a request to reset the password for the Stripe account associated with <a href="mailto:${email}">${email}</a>.</p>
        
        <div style="text-align: center; margin: 16px auto;">
         <a href="${resetLink}" style="display: inline-block; background-color: #6a4ff7; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px;">
         Reset password
         </a>
        </div>
        
        <p>If you didn't request this password reset, please disregard this email. Your account is secure and no changes have been made.</p>
        
        <p>— The Stripe team</p>
      </div>
    `,
    });
  } catch (err) {
    console.error(
      `[Mailer Error] Failed to send reset email to ${email}:`,
      err,
    );
    throw err;
  }
}

export async function sendNoAccountEmail(email: string) {
  try {
    await transporter.sendMail({
      from: `Stripe <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password reset request for Stripe',
      html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: 500; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 26px; font-weight: 700; line-height: 1.25; letter-spacing: -0.48px; color: #6a4ff7;">stripe</h2>
        
        <p>Hello,</p>
        
        <p>Someone recently requested a password reset for the Stripe account associated with <a href="mailto:${email}">${email}</a>.</p>
        
        <p><strong>However, there is no Stripe account associated with this email address.</strong></p>
        
        <div style="text-align: center; margin: 16px auto;">
         <a href="${process.env.FRONTEND_URL}/signup" style="display: inline-block; background-color: #6a4ff7; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px;">
         Create an account
         </a>
        </div>
        
        <p>If you didn't request this or don't intend to create an account, you can safely disregard this email.</p>
        
        <p>— The Stripe team</p>
      </div>
    `,
    });
  } catch (err) {
    console.error(
      `[Mailer Error] Failed to send reset email to ${email}:`,
      err,
    );
    throw err;
  }
}

transporter.verify(function (error, success) {
  if (error) {
    console.log(
      '❌ CONNECTION ERROR: Your EMAIL_USER or EMAIL_PASS is likely wrong.',
    );
    console.log(error);
  } else {
    console.log('🚀 SUCCESS: Your server is connected and ready to send!');
  }
});
