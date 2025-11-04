const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party'
  },
  type: {
    type: String,
    enum: ['payment_in', 'payment_out', 'sale', 'purchase', 'expense', 'income'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'bank', 'cheque', 'upi', 'card', 'other'],
    default: 'cash'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  linkedDocument: {
    documentType: {
      type: String,
      enum: ['sale', 'purchase', 'none'],
      default: 'none'
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
