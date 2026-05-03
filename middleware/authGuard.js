import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

/**
 * Verify JWT token and attach user to request
 */
export const authGuard = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    throw new AppError('Not authorized to access this resource', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }
});

/**
 * Verify user is admin
 */
export const isAdmin = asyncHandler((req, res, next) => {
  if (!req.user?.isAdmin) {
    throw new AppError('Admin access required', 403);
  }
  next();
});

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Silently fail optional auth
    }
  }

  next();
});

export default authGuard;
