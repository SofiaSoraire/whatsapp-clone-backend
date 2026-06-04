import express from 'express';
import { updateProfile, searchUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // todas las rutas requieren autenticación

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar perfil del usuario
 */
router.put('/me', updateProfile);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Buscar usuarios por nickname o email
 */
router.get('/search', searchUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil propio
 */
router.get('/me', (req, res) => {
  res.json(req.user);
});
router.get('/search', searchUsers);

router.put('/me', updateProfile);

export default router;