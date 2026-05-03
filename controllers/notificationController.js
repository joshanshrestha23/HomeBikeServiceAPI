import Notification from '../models/notificationModel.js';

export const createNotification = async (req, res) => {
  const { message, receiver, sender } = req.body;

  if (!message || !receiver) {
    return res.status(400).json({
      message: 'Please enter all fields',
      success: false,
    });
  }

  try {
    const newNotification = new Notification({
      message,
      receiver,
      timestamp: new Date(),
    });

    await newNotification.save();

    res.status(200).json({
      message: `Notification received successfully from ${sender}`,
      success: true,
      newNotification,
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

export default { createNotification };
