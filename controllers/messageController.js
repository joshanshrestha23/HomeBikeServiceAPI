import path from 'path';
import { fileURLToPath } from 'url';

import Message from '../models/messageModel.js';
import { getIo, users } from '../service/socketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createMessage = async (req, res) => {
  const { message, receiver, type } = req.body;
  const sender = req.user.id;

  if (!message || !receiver) {
    return res.status(400).json({
      message: 'Please enter all fields',
      success: false,
    });
  }

  try {
    const newMessage = new Message({
      message,
      sender,
      receiver,
      type,
      timestamp: new Date(),
    });

    await newMessage.save();
    const messageWithUsers = await Message.findById(newMessage._id)
      .populate('sender')
      .populate('receiver');

    const io = getIo();

    io.to(users[sender]).to(users[receiver]).emit('message', messageWithUsers);

    if (receiver && users[receiver]) {
      io.to(users[receiver]).emit('sended', messageWithUsers);
    } else {
      io.emit('sended', messageWithUsers);
    }

    res.status(200).json({
      message: 'Message sent successfully',
      success: true,
      newMessage: messageWithUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

export const getAllMessages = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.id },
        { sender: req.params.id, receiver: req.user.id },
      ],
    })
      .populate('sender')
      .populate('receiver')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      messages,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found',
        success: false,
      });
    }

    const io = getIo();
    io.emit('sended', message);

    res.status(200).json({
      message,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

export const saveFile = async (req, res) => {
  let type = 'file';

  if (!req.files) {
    return res.status(400).json({
      message: 'Please upload a file',
      success: false,
    });
  }

  const { file } = req.files;
  const fileName = `${Date.now()}_${file.name}`;

  try {
    if (file.mimetype.includes('image')) {
      await file.mv(path.join(__dirname, '../public/messages/images', fileName));
      type = 'image';
    } else {
      await file.mv(path.join(__dirname, '../public/messages/files', fileName));
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      success: true,
      file: fileName,
      type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};

export default {
  createMessage,
  getAllMessages,
  getMessageById,
  saveFile,
};
