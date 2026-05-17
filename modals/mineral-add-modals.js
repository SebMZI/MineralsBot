const Inventory = require("../db/models/inventory.js");
const Mineral = require("../db/models/mineral.js");
const log = require("../utils/logs.js");

module.exports = {
  customId: "mineral-add-modal",

  async execute(interaction) {
    const mineralId = interaction.customId.split(":")[1];

    const quantity = interaction.fields.getTextInputValue("quantity");
    const quality = interaction.fields.getTextInputValue("quality");

    const quantityNum = Number(quantity);
    const qualityNum = Number(quality);

    if (
        isNaN(quantityNum) ||
        isNaN(qualityNum) ||
        quantityNum <= 0 ||
        qualityNum < 0 ||
        qualityNum > 1000
    ) {
      return interaction.reply({
        content:
            "Quantity must be a positive number and quality must be a number between 0 and 1000.",
        ephemeral: true,
      });
    }

    const mineral = await Mineral.findById(mineralId);

    if (!mineral) {
      return interaction.reply({
        content: "This mineral no longer exists.",
        ephemeral: true,
      });
    }

    const mineralName = mineral.name;
    const discordId = interaction.user.id;

    try {
      let userInventory = await Inventory.findOne({ discordId });

      if (!userInventory) {
        userInventory = new Inventory({
          discordId,
          minerals: [],
        });
      }

      const existingMineral = userInventory.minerals.find(
          (mineral) =>
              mineral.mineralId.toString() === mineralId &&
              mineral.quality === qualityNum
      );

      if (existingMineral) {
        existingMineral.quantity += quantityNum;
      } else {
        userInventory.minerals.push({
          mineralId,
          quantity: quantityNum,
          quality: qualityNum,
        });
      }

      await userInventory.save();

      await log(
          `User ${interaction.user.username} added mineral ${mineralName}: qty ${quantityNum}, quality ${qualityNum}`
      );

      return interaction.reply({
        content: `Added ${quantityNum}x ${mineralName} with quality ${qualityNum}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);

      await log(
          `[ERROR] Failed to add mineral for user ${interaction.user.username}: ${error.message}`
      );

      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: "An error occurred while adding the mineral.",
          ephemeral: true,
        });
      }
    }
  },
};