import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendResetEmail } from '../services/emailService.js';
import { logger } from '../services/loggerService.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { nickname }] });
    if (existing) {
      return res.status(400).json({ message: 'El email o nickname ya está en uso' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ email, password, nickname, verificationToken });
    
    // Auto-verificar sin enviar email
    // user.isVerified = true;
    // user.verificationToken = undefined;
    // await user.save();

    // Enviar email real
  await sendVerificationEmail(email, verificationToken);
  return res.status(201).json({ message: 'Usuario registrado. Revisa tu email para verificar la cuenta.' });
    
    logger.info(`Usuario registrado y auto-verificado: ${email}`);
    res.status(201).json({ message: 'Usuario registrado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ message: 'Token inválido' });
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.json({ message: 'Email verificado. Ya puedes iniciar sesión.' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  if (!user.isVerified) return res.status(401).json({ message: 'Verifica tu email primero' });
  const token = generateToken(user._id);
  logger.info(`User logged in: ${user.email}`);
  res.json({ token, user: { id: user._id, nickname: user.nickname, email: user.email, bio: user.bio } });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No hay ninguna cuenta con ese email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetExpires = Date.now() + 3600000;
    await user.save();

    // No enviamos email, devolvemos el token (solo pruebas)
    res.json({ 
      message: 'Token generado (modo pruebas). Usa este token para restablecer contraseña.',
      resetToken
    });
  } catch (error) {
    logger.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Token inválido o expirado' });
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();
  res.json({ message: 'Contraseña actualizada correctamente' });
};