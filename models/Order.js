const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true } // Price at moment of purchase
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    address: String,
    city: String,
    zip: String
  },
  status: {
    type: String,
    default: 'Processing', // Processing, Shipped, Delivered
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);