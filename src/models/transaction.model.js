import mongoose from 'mongoose';

const AutoIncrement = require('mongoose-sequence')(mongoose);

const transactionSchema = new mongoose.Schema(
  {
    deliveryDate: {
      type: Date,
      required: [true, 'The delivery date is required'],
    },

   supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
    },

    submittedBy: {
      type: String,
      required: [true, 'Supply Chain User is required'],
    },

    userid: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'The user is required'],
    },

    payload: {
      type: String,
      required: [true, 'Please provide description of goods or services'],
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
    },

    paymentVoucherNumber: {
      type: Number,
      required: [true, 'Please provide a payment voucher number'],
    },

    purchaseOrderNumber: {
      type: String,
      required: [true, 'Please provide a purchase order number'],
    },

    projectCode: {
      type: String,
      required: [true, 'Please provide a project code'],
    },

    activityLine: {
      // TODO: which format is this
      type: String,
      required: [true, 'Please provide the activity line'],
    },

    paymentRequisitionDate: {
      // TODO: How this is calculated
      type: Date,
      default: Date.now(),
    },

    amountToBePaid: {
      // TODO: How this is calculated
      type: Number,
    },

    invoiceAmount: {
      type: Number,
      required: [true, 'Please provide invoice amount'],
    },

    withholdingTax: {
      type: Number,
      required: [true, 'Withholding tax is requried'],
    },

    rejected: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'rejected'],
      default: 'open'
    },

    step: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'finance',
        'accounts',
        'manager',
        'approved',
      ],
      default: 'finance',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

transactionSchema.plugin(AutoIncrement, { inc_field: 'id' });

transactionSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'transaction',
  localField: '_id',
});

export default mongoose.model('Transaction', transactionSchema);
