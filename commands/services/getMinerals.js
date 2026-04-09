const { SlashCommandBuilder } = require("discord.js");

const Mineral = require("../../db/models/mineral");
const Inventory = require("../../db/models/inventory.js");
const { EmbedBuilder } = require("discord.js");
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getminerals")
    .setDescription("Get your inventory list"),
  async execute(interaction) {
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

      const embed = new EmbedBuilder()
        .setColor(0x23272a)
        .setTitle("My Mineral List")
        .setTimestamp()
        .setFooter({
          text: "Made by: Anrazzi",
        });

      console.log(inventory.minerals);
      const mineralList = await Promise.all(
        inventory.minerals.map(async (item, index) => {
          const mineralDoc = await Mineral.findById(item.mineralId);
          const mineralName = mineralDoc ? mineralDoc.name : "Unknown mineral";
          return `${index + 1}. ${mineralName} x${item.quantity} (${item.quality})`;
        }),
      );

      embed.addFields({
        name: "\u200b",
        value: mineralList.join("\n"),
      });

      log(
        `User ${interaction.user.username} retrieved their mineral inventory`,
      );
      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      log(
        `[ERROR] Failed to get minerals for user ${interaction.user.username}: ${error.message}`,
      );
    }
  },
};
