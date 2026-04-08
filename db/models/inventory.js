const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
  },
  minerals: [
    {
      mineralId: { type: mongoose.Schema.Types.ObjectId, ref: "Mineral" },
      quantity: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("Inventory", inventorySchema);
