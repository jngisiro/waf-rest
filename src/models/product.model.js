import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Provide the Product name'],
      unique: [true, 'Product gas already been registered'],
      maxlength: [40, 'Name must have less than 40 characters'],
      minlength: [10, 'Name must have more than 10 characters'],
    },

    category: String,

    description: {
      type: String,
      trim: true,
      required: [true, 'Provide the Product description'],
    },

    price: {
      type: Number,
      required: [true, 'Provide the product\'s price']
    },
    coverImage: String,
    quantityAvailable: Number
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model('Product', productSchema);
