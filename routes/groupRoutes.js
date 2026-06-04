import express from 'express';
import { createGroup, joinGroupByCode, leaveGroup, addAdmin, removeAdmin } from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.post('/', createGroup);
router.post('/join', joinGroupByCode);
router.post('/:groupId/leave', leaveGroup);
router.post('/:groupId/add-admin', addAdmin);
router.post('/:groupId/remove-admin', removeAdmin);
export default router;