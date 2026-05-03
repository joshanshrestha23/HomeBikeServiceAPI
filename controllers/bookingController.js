import Booking from '../models/bookingModel.js';

export const addToBooking = async (req, res) => {
  const {
    bikeId,
    bikeChasisNumber,
    bikeDescription,
    bookingDate,
    bookingTime,
    total,
    bikeNumber,
    bookingAddress,
  } = req.body;
  const id = req.user.id;

  if (
    !bikeId ||
    !bikeChasisNumber ||
    !bikeDescription ||
    !bookingDate ||
    !bookingTime ||
    !total ||
    !bikeNumber ||
    !bookingAddress
  ) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const dateOnly = bookingDate.split('T')[0];
    const bookingDateTime = new Date(`${dateOnly}T${bookingTime}:00+05:45`);

    if (Number.isNaN(bookingDateTime.getTime())) {
      return res.status(400).json({ message: 'Enter Valid Date' });
    }

    if (bookingDateTime < new Date()) {
      return res.status(400).json({ message: 'Enter Valid Date' });
    }

    const bookingStartTime = new Date(bookingDateTime);
    bookingStartTime.setHours(bookingStartTime.getHours() - 2);

    const bookingTimeCheck = await Booking.find({
      bookingTime: {
        $gte: bookingStartTime,
        $lte: bookingDateTime,
      },
    });

    if (bookingTimeCheck.length > 0) {
      return res
        .status(400)
        .json({ message: 'Bike already booked for this time' });
    }

    const itemInBooking = await Booking.findOne({
      bikeNumber,
      userId: id,
      status: 'pending',
    });

    if (itemInBooking) {
      return res.status(400).json({ message: 'Bike already in booking' });
    }

    const bookingItem = new Booking({
      bikeId,
      bikeChasisNumber,
      bikeDescription,
      bookingTime: bookingDateTime,
      bikeNumber,
      bookingAddress,
      total,
      userId: id,
    });

    await bookingItem.save();
    res.status(200).json({ message: 'Item added to booking' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBookingItems = async (req, res) => {
  try {
    const bookingItems = await Booking.find({})
      .populate('bikeId')
      .populate('userId');
    res.status(200).json({ bookings: bookingItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBookingItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsersWithBookings = async (req, res) => {
  try {
    const users = await Booking.find({
      userId: req.user.id,
      status: 'pending',
    })
      .populate('userId')
      .populate('bikeId');

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'canceled';
    await booking.save();

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const id = req.user.id;
    const booking = await Booking.find({ userId: id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.updateMany({ userId: id }, { status: 'completed' });

    res.status(200).json({ message: 'Booking status successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

export default {
  addToBooking,
  getAllBookingItems,
  deleteBookingItem,
  getUsersWithBookings,
  cancelBooking,
  updateBooking,
};
