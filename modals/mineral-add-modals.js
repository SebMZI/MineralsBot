const Inventory = require("../db/models/inventory.js");
const Mineral = require("../db/models/mineral.js");
const log = require("../utils/logs.js");

module.exports = {
  customId: "mineral-add-modal",
  async execute(interaction) {
    const mineralId =
      interaction.fields.getStringSelectValues("mineralSelect")[0];
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
    const mineralName = mineral.name;

    const discordId = interaction.user.id;

    try {
      const userInventory = await Inventory.findOne({
        discordId: discordId,
      });

      if (userInventory) {
        const existingMineral = userInventory.minerals.find(
          (mineral) =>
            mineral.mineralId.toString() == mineralId &&
            mineral.quality == Number(quality),
        );

        if (existingMineral) {
          existingMineral.quantity = quantityNum;
        } else {
          userInventory.minerals.push({
            mineralId: mineralId,
            quantity: quantityNum,
            quality: qualityNum,
          });
        }

        await userInventory.save();

        log(
          `User ${interaction.user.username} updated mineral ${mineralName}: qty ${quantityNum}, quality ${qualityNum}`,
        );
        return await interaction.reply({
          content: `The mineral (${mineralName}) has been updated. Qty: ${quantityNum}, Qlty: ${qualityNum}`,
          ephemeral: true,
        });
      }

      const inventory = new Inventory({
        discordId: discordId,
        minerals: [],
      });

      inventory.minerals.push({
        mineralId: mineralId,
        quantity: quantityNum,
        quality: qualityNum,
      });

      await inventory.save();

      log(
        `User ${interaction.user.username} added new mineral ${mineralName}: qty ${quantityNum}, quality ${qualityNum}`,
      );
      return interaction.reply({
        content: `Mineral (${mineralName}) updated to Qty: ${quantityNum}, Qlty: ${qualityNum}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      log(
        `[ERROR] Failed to add mineral for user ${interaction.user.username}: ${error.message}`,
      );
    }
  },
};
