import express from 'express';
import protect, { requireAdmin } from '../middleware/auth.js';
import { adminOverview, setUserBlocked, deleteUser } from '../controllers/adminController.js';

const router = express.Router();
router.use(protect, requireAdmin);
router.get('/overview', adminOverview);
router.patch('/users/:userId/block', setUserBlocked);
router.delete('/users/:userId', deleteUser);

export default router;
