import nodemailer from 'nodemailer';
import env from './env.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.gmail.email,
        pass: env.gmail.appPassword
    }
});

export const sendOtpEmail = async (to, otp) => {
    await transporter.sendMail({
        from: `"Delora Market" <${env.gmail.email}>`,
        to,
        subject: 'كود التحقق - Delora Market',
        html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #2d6a4f;">Delora Market</h2>
                <p>كود التحقق الخاص بك هو:</p>
                <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; padding: 15px; background: #f0fdf4; border-radius: 6px; color: #2d6a4f;">${otp}</div>
                <p style="color: #666;">هذا الكود صالح لمدة 10 دقائق فقط.</p>
            </div>
        `
    });
};

export default transporter;
