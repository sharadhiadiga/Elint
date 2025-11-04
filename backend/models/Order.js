const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    rate: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['queue', 'in_progress', 'completed', 'cancelled'],
    default: 'queue'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  startedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  estimatedCompletionDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ status: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
