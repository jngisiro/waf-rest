import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderDate: {
      type: Date,
      required: [true, 'The order date is required'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'The user is required'],
    },

    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
      },
    ],

    paymentMethod: {
      type: String,
      required: [true, 'Please provide a payment method'],
    },

    status: {
      type: String,
      enum: ['pending', 'cancelled', 'confirmed', 'archived'],
      default: 'pending',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model('Order', orderSchema);
