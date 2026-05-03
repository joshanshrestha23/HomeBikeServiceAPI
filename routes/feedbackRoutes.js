import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

router.post('/submit', authGuard, feedbackController.submitFeedback);
router.post('/postFeedback', authGuard, feedbackController.submitFeedback);
router.get('/get', authGuard, feedbackController.getFeedback);
router.get('/getFeedback', authGuard, feedbackController.getFeedback);

export default router;
