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
          existingMineral.quantity = Number(quantity);
        } else {
          userInventory.minerals.push({
            mineralId: mineralId,
            quantity: Number(quantity),
            quality: Number(quality),
          });
        }

        await userInventory.save();

        log(
          `User ${interaction.user.username} updated mineral ${mineralName}: qty ${quantity}, quality ${quality}`,
        );
        return await interaction.reply({
          content: `The mineral (${mineralName}) has been updated. Qty: ${quantity}, Qlty: ${quality}`,
          ephemeral: true,
        });
      }

      const inventory = new Inventory({
        discordId: discordId,
        minerals: [],
      });

      inventory.minerals.push({
        mineralId: mineralId,
        quantity: Number(quantity),
        quality: Number(quality),
      });

      await inventory.save();

      log(
        `User ${interaction.user.username} added new mineral ${mineralName}: qty ${quantity}, quality ${quality}`,
      );
      return interaction.reply({
        content: `Mineral (${mineralName}) updated to Qty: ${quantity}, Qlty: ${quality}`,
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
