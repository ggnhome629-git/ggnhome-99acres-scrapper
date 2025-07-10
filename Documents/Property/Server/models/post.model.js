

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  image: {
    type: [String],
    required: false
  },
  price: {
    type: Number,
    required: true
  },
  pricePerSqFt: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  locality: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  preferred: {
    type: Boolean,
    default: false
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available'
  }
});

module.exports = mongoose.model("Post", PostSchema);