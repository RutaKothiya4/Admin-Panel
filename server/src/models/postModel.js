const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
});

const Quote = mongoose.model("Quote", quoteSchema);
module.exports = { Quote };
