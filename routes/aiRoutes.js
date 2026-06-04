import express from 'express';
import { askChat, getAIHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.post('/ask', askChat);
router.get('/history/:chatId', getAIHistory);

export default router;