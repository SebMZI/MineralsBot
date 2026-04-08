const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const Mineral = require("../../db/models/mineral");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getminerallist")
    .setDescription("Get the list of minerals")
    .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator)
    .addBooleanOption((option) => {
      option
        .setName("is-active")
        .setDescription("Get active or inactive minerals");
    }),
  async execute(interaction) {
    const active = interaction.options.getBoolean("is-active");
    try {
      const minerals = await Mineral.find({
        active: active,
      });
      if (minerals.length == 0) {
        return await interaction.followUp({
          content: "No minerals in the list",
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x23272a)
        .setTitle("Mineral List")
        .setTimestamp()
        .setFooter({
          text: "Made by: Anrazzi",
        });

      minerals.map((mineral, index) => {
        embed.addFields({
          name: `${index}.`,
          value: mineral.name,
        });
      });
      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
};
