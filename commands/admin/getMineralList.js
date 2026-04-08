const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Mineral = require("../../db/models/mineral");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getminerallist")
    .setDescription("Get the list of minerals")
    .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator)
    .addBooleanOption((option) =>
      option
        .setName("isactive")
        .setDescription("Get active or inactive minerals"),
    ),
  async execute(interaction) {
    const active = interaction.options.getBoolean("isactive") ?? true;

    try {
      const minerals = await Mineral.find({
        active: active,
      });
      if (minerals.length == 0) {
        return await interaction.reply({
          content: "No minerals in the list",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x23272a)
        .setTitle("Mineral List")
        .setTimestamp()
        .setFooter({
          text: "Made by: Anrazzi",
        });

      const mineralList = minerals
        .map((mineral, index) => `${index + 1}. ${mineral.name}`)
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
