const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  phone: String,
  email: String,
  facebook: String,
  instagram: String,
  tiktok: String,
  workingHours: String
}, {_id: false}); // _id: false because this is a subdocument

const settingsSchema = new mongoose.Schema({
  contactInfo: {
    type: contactInfoSchema,
    default: {}
  },
  siteLogoUrl: {
    type: String,
    default: ''
  },
  heroSliderImages: {
    type: [String],
    default: []
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id; // Though settings might not use id prominently in UI
      delete ret._id;
      delete ret.__v;
    }
  }
});

// For settings, we usually only want a single document in the collection.
// We can handle this logic in the API routes (e.g., findOneAndUpdate with upsert:true)

// Collection will be named 'settings'
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
