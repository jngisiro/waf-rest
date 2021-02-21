import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderDate: {
      type: Date,
      default: Date.now()
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
      default: 'Cash on Delivery'
    },

    status: {
      type: String,
      enum: ['pending', 'cancelled', 'confirmed', 'archived'],
      default: 'pending',
    },

    name: String,
    email: String,
    phone: String,
    district: String,
    subcounty: String,
    parish: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model('Order', orderSchema);
