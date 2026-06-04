import nodemailer from 'nodemailer';
import { logger } from './loggerService.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Verifica tu cuenta',
    html: `Click <a href="${url}">aquí</a> para verificar tu email.`
  });
  logger.info(`Verification email sent to ${email}`);
};

export const sendResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Restablecer contraseña',
    html: `Click <a href="${url}">aquí</a> para restablecer tu contraseña.`
  });
};