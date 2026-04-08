const mongoose = require("mongoose");

const mineralSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Mineral", mineralSchema);
