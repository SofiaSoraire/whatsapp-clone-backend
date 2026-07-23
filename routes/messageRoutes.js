import express from 'express';
import { protect } from '../middleware/auth.js';
import { createMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();
router.use(protect);

router.post('/', createMessage);
router.get('/:chatId', getMessages);

export default router;