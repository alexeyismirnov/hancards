import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        charVariant: true,
      },
    });

    // Generate JWT token
    const token = signToken({ userId: user.id });

    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Login an existing user
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = signToken({ userId: user.id });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        charVariant: user.charVariant,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    // User ID is set by auth middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        charVariant: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

/**
 * Update user preferences (character variant)
 */
export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { charVariant } = req.body;

    // Validate charVariant
    if (charVariant !== 'simplified' && charVariant !== 'traditional') {
      return res.status(400).json({
        error: 'Invalid character variant. Must be "simplified" or "traditional"',
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        charVariant,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        charVariant: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}
