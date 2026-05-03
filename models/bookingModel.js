import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'bikeProduct' },
  bookingAddress: { type: String },
  bikeChasisNumber: { type: String },
  bikeDescription: { type: String },
  bookingTime: { type: Date },
  status: { type: String, default: 'pending' },
  total: { type: Number },
  bikeNumber: { type: String },
});

const Booking = mongoose.model('booking', bookingSchema);

export default Booking;
