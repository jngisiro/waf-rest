import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderDate: {
      type: Date,
      required: [true, 'The order date is required'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'The user is required'],
    },

    products: {
      type: [mongoose.Schema.ObjectId],
      required: [true, 'Product ID is required'],
    },

    paymentMethod: {
      type: Number,
      required: [true, 'Please provide a payment voucher number'],
    },

    status: {
      type: String,
      enum: ['pending', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model('Order', orderSchema);
