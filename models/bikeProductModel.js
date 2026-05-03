import mongoose from 'mongoose';

const bikeProductSchema = new mongoose.Schema({
  bikeName: {
    type: String,
    required: true,
  },
  bikePrice: {
    type: String,
    required: true,
  },
  bikeImage: {
    type: String,
    required: true,
  },
  bikeModel: {
    type: String,
    required: true,
  },
});

const BikeProduct = mongoose.model('bikeProduct', bikeProductSchema);

export default BikeProduct;
