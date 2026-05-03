import express from 'express';
import * as bikeProductController from '../controllers/bikeProductController.js';
import { authGuard, isAdmin } from '../middleware/authGuard.js';

const router = express.Router();

router.post(
  '/create',
  authGuard,
  isAdmin,
  bikeProductController.createBikeProduct,
);
router.post(
  '/create/bike',
  authGuard,
  isAdmin,
  bikeProductController.createBikeProduct,
);
router.get('/', bikeProductController.getAllBikes);
router.get('/get_all_bikes', bikeProductController.getAllBikes);
router.get('/pagination/list', bikeProductController.paginationBike);
router.get('/pagination', bikeProductController.paginationBike);
router.get('/count/total', bikeProductController.getTotalBike);
router.get('/bike_count', bikeProductController.getTotalBike);
router.get('/models/all', bikeProductController.getAllBikeModel);
router.get('/filter/model', bikeProductController.getBikeByModel);
router.get('/model', bikeProductController.getBikeByModel);
router.get('/get_one_bike/:id', bikeProductController.getSingleBike);
router.put('/update_bike/:id', authGuard, isAdmin, bikeProductController.updateBike);
router.delete('/delete_bike/:id', authGuard, isAdmin, bikeProductController.deleteBike);
router.get('/:id', authGuard, bikeProductController.getSingleBike);
router.put('/:id', authGuard, isAdmin, bikeProductController.updateBike);
router.delete('/:id', authGuard, isAdmin, bikeProductController.deleteBike);

export default router;
