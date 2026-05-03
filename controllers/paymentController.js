import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import {
  initializeKhaltiPayment,
  verifyKhaltiPayment,
} from '../service/khaltiService.js';

export const initializePayment = async (req, res) => {
  try {
    const { totalPrice, website_url } = req.body;
    const bookingInput = req.body.bookings || [];
    const bookings = bookingInput.map((booking) => booking._id);

    const populatedBookings = await Booking.find({ _id: { $in: bookings } });
    const productNames = populatedBookings
      .map((booking) => booking.bikeNumber)
      .filter(Boolean)
      .join(', ');

    if (!productNames) {
      return res.send({
        success: false,
        message: 'No booking names found',
      });
    }

    const orderModelData = await Payment.create({
      bookings,
      paymentGateway: 'khalti',
      amount: totalPrice,
      status: 'pending',
    });

    const paymentInitiate = await initializeKhaltiPayment({
      amount: totalPrice * 100, // Convert to Paisa
      purchase_order_id: orderModelData._id,
      purchase_order_name: productNames,
      return_url: `${website_url}/thankyou`,
      website_url: website_url,
    });

    await Payment.updateOne(
      { _id: orderModelData._id },
      {
        $set: {
          transactionId: paymentInitiate.pidx,
          pidx: paymentInitiate.pidx,
        },
      },
    );

    res.json({
      success: true,
      OrderModelData: orderModelData,
      payment: paymentInitiate,
      pidx: paymentInitiate.pidx,
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.json({
      success: false,
      error: error.message || 'An error occurred',
    });
  }
};

export const completeKhaltiPayment = async (req, res) => {
  const { pidx, amount } = req.query;
  const purchaseOrderId = req.query.purchase_order_id || req.query.productId;

  try {
    const paymentInfo = await verifyKhaltiPayment(pidx);

    if (
      paymentInfo?.status !== 'Completed' ||
      paymentInfo.pidx !== pidx ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete or invalid payment information',
        paymentInfo,
      });
    }

    const paymentData = await Payment.findOneAndUpdate(
      { _id: purchaseOrderId },
      {
        $set: {
          pidx,
          transactionId: paymentInfo.transaction_id,
          status: 'success',
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: 'Payment Successful',
      paymentData,
      transactionId: paymentInfo.transaction_id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during payment verification',
      error: error.message || 'An unknown error occurred',
    });
  }
};

export default { initializePayment, completeKhaltiPayment };
