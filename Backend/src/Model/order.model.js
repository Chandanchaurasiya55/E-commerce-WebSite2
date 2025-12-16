const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String },
  price: { type: String },
  img: { type: String },
  images: { type: [String], default: [] },
  quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema({
  // user is optional to support guest/anonymous orders
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, default: 0 },
  status: { type: String, default: 'placed' },
  paymentMethod: { type: String },
  shippingAddress: {
    name: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String },
    // optional coordinates if you want to store geo location
    coordinates: { lat: Number, lng: Number }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
