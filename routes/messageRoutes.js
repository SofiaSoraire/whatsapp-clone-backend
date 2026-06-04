import express from 'express';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
// Aquí puedes agregar rutas de mensajes si las necesitas
export default router;