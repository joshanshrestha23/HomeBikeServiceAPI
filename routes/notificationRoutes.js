import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

router.post('/send', authGuard, notificationController.createNotification);

export default router;
