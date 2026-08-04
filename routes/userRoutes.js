import express from 'express';
import { updateProfile, searchUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // todas las rutas requieren autenticación

router.get('/me', (req, res) => {
  res.json(req.user);
});
router.get('/search', searchUsers);

router.put('/me', updateProfile);

export default router;