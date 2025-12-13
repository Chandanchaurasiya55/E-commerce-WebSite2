const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: String, required: true },
  // support up to 3 images per product; keep `img` for backward compatibility
  images: {
    type: [String],
    validate: {
      validator: function (arr) { return !arr || arr.length <= 3; },
      message: 'A product can contain at most 3 images.'
    },
    default: []
  },
  img: { type: String },
  description: { type: String, default: '' },
  // Basic reviews support — stored as an array of small review objects
  VAT: [
    {
      name: { type: String, required: true, trim: true},
      createdAt: { type: Date, default: Date.now }
    }
  ],
  seller: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
