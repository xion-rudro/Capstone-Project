import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.post('/register', [
  body('email').isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 10, max: 128 }).withMessage('Use a password between 10 and 128 characters.')
], register);
router.post('/login', [body('email').isEmail().withMessage('Enter a valid email address.'), body('password').notEmpty().withMessage('Password is required.')], login);
router.post('/logout', logout);
router.get('/me', protect, getProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
