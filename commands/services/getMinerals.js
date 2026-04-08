const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
} = require("discord.js");

const Mineral = require("../../db/models/mineral");
const Inventory = require("../../db/models/inventory.js");
const { EmbedBuilder } = require("discord.js");

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

      const mineralList = inventory.minerals
        .map(
          (mineral, index) =>
            `${index + 1}. ${mineral.name} x${mineral.quantity} (${mineral.quality})`,
        )
        .join("\n");

      embed.addFields({
        name: "\u200b",
        value: mineralList,
      });

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
};
