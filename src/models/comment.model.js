import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Comment must have a message'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must have author'],
    },

    transaction: {
      type: mongoose.Schema.ObjectId,
      ref: 'Transaction',
      required: [true, 'Comment must have a transaction'],
    },

    createdAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstname lastname role',
  });

  next();
});

export default mongoose.model('Comment', commentSchema);
