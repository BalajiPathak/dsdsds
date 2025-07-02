import express from 'express';
import {
  register,
  login,
  getMe,
  logout
} from '../auth/auth.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import passport from 'passport';

const router = express.Router();

// Public routes
router.post('/register', register);                     // POST /auth/register
router.post('/login', login);                           // POST /auth/login

// Protected routes
router.get('/me', isAuthenticated, getMe);              // GET /auth/me
router.post('/logout', isAuthenticated, logout);            // POST /auth/logout

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.FRONTEND_URL + '/dashboard',
    failureRedirect: process.env.FRONTEND_URL + '/login',
  })
);

export default router;
