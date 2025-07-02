import express from 'express';
import {
  register,
  login,
  getMe,
  logout
} from '../auth/auth.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

// Public routes
router.post('/register', register);                     // POST /auth/register
router.post('/login', login);                           // POST /auth/login

// Protected routes
router.get('/me', isAuthenticated, getMe);              // GET /auth/me
router.post('/logout', isAuthenticated, logout);            // POST /auth/logout

export default router;
