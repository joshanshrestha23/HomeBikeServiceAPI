import BikeProduct from '../models/bikeProductModel.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUserLogins = await User.countDocuments({});
    const totalBikesAdded = await BikeProduct.countDocuments({});
    const totalBookings = await Booking.countDocuments({});

    res.status(200).json({
      totalUserLogins,
      totalBikesAdded,
      totalBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

export default { getDashboardStats };
