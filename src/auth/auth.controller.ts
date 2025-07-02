import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import passport from 'passport';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        provider: 'local',
        role: 'CUSTOMER',
      },
    });
    req.login(user, (err) => {
      if (err) return next(err);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        message: 'Registered and logged in successfully',
        user: userWithoutPassword
      });
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    req.login(user, (err) => {
      if (err) return next(err);
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        message: 'Logged in successfully',
        user: userWithoutPassword
      });
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userSession = req.user as any;
    if (!userSession) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        provider: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

export const googleCallback = (req: Request, res: Response) => {
  // This will be handled differently with JWT
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};
