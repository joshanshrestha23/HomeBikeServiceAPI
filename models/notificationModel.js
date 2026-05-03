import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

const Notification = mongoose.model('notifications', notificationSchema);

export default Notification;
