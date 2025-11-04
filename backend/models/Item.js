const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  itemCode: {
    type: String,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'PCS'
  },
  salePrice: {
    type: Number,
    default: 0
  },
  purchasePrice: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  hsnCode: {
    type: String,
    trim: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
