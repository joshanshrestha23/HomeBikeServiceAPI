import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

router.post('/send', authGuard, messageController.createMessage);
router.get('/:id', authGuard, messageController.getAllMessages);
router.get('/detail/:id', authGuard, messageController.getMessageById);
router.post('/file', messageController.saveFile);

export default router;
