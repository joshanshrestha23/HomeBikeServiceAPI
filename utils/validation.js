import { z } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema for validation
 * @param {string} source - 'body', 'params', or 'query'
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join('.')} - ${e.message}`)
          .join(', ');
        return next(new AppError(message, 400));
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  // User validation
  userRegister: z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  userLogin: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  // Bike validation
  createBike: z.object({
    name: z.string().min(3, 'Bike name is required'),
    model: z.string().min(2, 'Model is required'),
    price: z.number().positive('Price must be positive'),
    description: z.string().optional(),
  }),

  // Booking validation
  createBooking: z.object({
    bikeId: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),

  // Feedback validation
  createFeedback: z.object({
    rating: z.number().min(1).max(5),
    message: z.string().min(5, 'Feedback must be at least 5 characters'),
  }),
};

export default validate;
