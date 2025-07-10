const mongoose = require("mongoose");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  preferredPlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }]
});

// Exporting the model
module.exports = mongoose.model("User", UserSchema);