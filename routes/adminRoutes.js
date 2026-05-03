import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { authGuard, isAdmin } from '../middleware/authGuard.js';

const router = express.Router();

/**
 * Admin routes - protected
 */
router.get('/dashboard', authGuard, isAdmin, getDashboardStats);
router.get('/dashboard_stats', authGuard, isAdmin, getDashboardStats);

export default router;
