import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import passport from 'passport';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        provider: 'local',
      },
    });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login after registration failed' });
      res.status(201).json({ message: 'Registered and logged in successfully', user });
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Login failed' });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ message: 'Logged in successfully', user });
    });
  })(req, res, next);
};

export const googleCallback = (req: Request, res: Response) => {
  // Redirect after successful Google login
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};

export const getMe = (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.status(200).json({ user: req.user });
};

export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
