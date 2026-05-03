import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

router.post('/initialize', authGuard, paymentController.initializePayment);
router.post('/initialize_khalti', authGuard, paymentController.initializePayment);
router.get('/complete', paymentController.completeKhaltiPayment);

export default router;
