const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'Product must have at least one image']
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Ensure mongoose doesn't try to pluralize 'Product' to 'productsies' or something unexpected
// It will create a collection named 'products'
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
