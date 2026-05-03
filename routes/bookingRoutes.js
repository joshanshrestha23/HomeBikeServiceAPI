import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

router.post('/add', authGuard, bookingController.addToBooking);
router.get('/all', bookingController.getAllBookingItems);
router.delete('/delete/:id', bookingController.deleteBookingItem);
router.delete('/:id', bookingController.deleteBookingItem);
router.get('/user', authGuard, bookingController.getUsersWithBookings);
router.get('/userBooking', authGuard, bookingController.getUsersWithBookings);
router.put('/cancel/:id', authGuard, bookingController.cancelBooking);
router.put('/status', authGuard, bookingController.updateBooking);

export default router;
