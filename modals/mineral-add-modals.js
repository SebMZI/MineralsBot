const { MessageFlags } = require("discord.js");
const Inventory = require("../db/models/inventory.js");

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
        userInventory.minerals.map((mineral) => {
          if (
            mineral.mineralId == mineralId &&
            mineral.quality == Number(quality)
          ) {
            mineral.quantity = Number(quantity);
          }
        });

        await userInventory.save();

        return await interaction.reply({
          content: `The mineral (${mineralName}) has been updated. Qty: ${quantity}, Qlty: ${quality}`,
          ephemeral: true,
        });
      }

      const inventory = await new Inventory({
        discordId: discordId,
        minerals: [],
      });

      inventory.minerals.push({
        mineralId: mineralId,
        quantity: Number(quantity),
        quality: Number(quality),
      });

      await inventory.save();

      return interaction.reply({
        content: `Mineral (${mineralName}) updated to Qty: ${quantity}, Qlty: ${quality}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
