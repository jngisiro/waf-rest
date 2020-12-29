import mongoose from 'mongoose';
import slugify from 'slugify';

const payloadSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Provide the Hotel name'],
      unique: true,
      maxlength: [40, 'Name must have less than 40 characters'],
      minlength: [10, 'Name must have more than 10 characters'],
    },

    slug: String,

    description: {
      type: String,
      trim: true,
      required: [true, 'Provide the Hotel description'],
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'Provide the Hotel summary'],
    },

    active: false,

    price: {
      avgPrice: Number,
      deluxe: Number,
      Suite: Number,
      Ordinary: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

payloadSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

payloadSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

payloadSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'hotel',
  localField: '_id',
});

payloadSchema.post('save', function (next) {});

export default mongoose.model('Payload', payloadSchema);
