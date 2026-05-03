import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    default: 'text',
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const Message = mongoose.model('messages', messageSchema);

export default Message;
