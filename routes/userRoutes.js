import express from 'express';
import * as userController from '../controllers/userControllers.js';
import { authGuard, optionalAuth } from '../middleware/authGuard.js';
import { schemas, validate } from '../utils/validation.js';

const router = express.Router();

/**
 * Public routes
 */
router.post(
  '/register',
  validate(schemas.userRegister),
  userController.createUser,
);
router.post('/create', validate(schemas.userRegister), userController.createUser);
router.post('/login', validate(schemas.userLogin), userController.loginUser);
router.post('/google', userController.googleLogin);
router.post('/forgot-password', userController.forgotPassword);
router.post('/forgot_password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/reset_password', userController.resetPassword);

/**
 * Protected routes
 */
router.get('/profile', authGuard, userController.getCurrentProfile);
router.get('/current_profile', authGuard, userController.getCurrentProfile);
router.put('/profile', authGuard, userController.updateUserProfile);
router.put('/update_profile', authGuard, userController.updateUserProfile);
router.get('/all', optionalAuth, userController.getAllUser);
router.get('/get_all_user', optionalAuth, userController.getAllUser);

/**
 * Token routes
 */
router.post('/token/refresh', userController.getToken);

/**
 * Email verification routes
 */
router.post('/email/forgot-password', userController.forgotPasswordByEmail);
router.post('/email/reset-password', userController.resetPasswordByEmail);
router.post('/email/verify-user', userController.getUserByGoogleEmail);

export default router;
