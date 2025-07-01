import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  googleCallback,
  getMe,
  logout
} from '../auth/auth.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

// All routes will be prefixed with /auth

router.post('/register', register);                     // POST /auth/register
router.post('/login', login);                           // POST /auth/login

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));                                                    // GET /auth/google

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleCallback                                        // GET /auth/google/callback
);

router.get('/me', isAuthenticated, getMe);              // GET /auth/me
router.post('/logout', logout);                          // GET /auth/logout

export default router;
