const Inventory = require("../db/models/inventory.js");
const log = require("../utils/logs.js");

module.exports = {
  customId: "mineral-remove-select",
  async execute(interaction) {
    const mineralId = interaction.fields.getStringSelectValues(
      "mineral-remove-select",
    )[0];

    const discordId = interaction.user.id;

    try {
      const inventory = await Inventory.findOne({
        discordId: discordId,
      });

      if (!inventory) {
        return await interaction.reply({
          content: `No inventory found`,
          ephemeral: true,
        });
      }

      inventory.minerals.filter((mineral) => {
        return mineral.mineralId != mineralId;
      });

      await inventory.save();
      log(`User ${interaction.user.username} removed mineral from inventory`);
      return await interaction.reply({
        content: `Mineral removed from your inventory`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      log(
        `[ERROR] Failed to remove mineral for user ${interaction.user.username}: ${error.message}`,
      );
    }
  },
};
