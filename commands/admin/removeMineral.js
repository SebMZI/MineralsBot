const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

const Mineral = require("../../db/models/mineral");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removemineralfromlist")
    .setDescription("Remove a mineral from the list of minerals")
    .addStringOption((option) =>
      option
        .setName("mineral-name")
        .setDescription("The name of the mineral to remove from the list"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator),
  async execute(interaction) {
    const mineralName = interaction.options.getString("mineral-name");

    if (!mineralName) {
      return await interaction.reply({
        content: "Mineral name is required",
        ephemeral: true,
      });
    }

    try {
      const mineral = await Mineral.findOne({
        name: mineralName,
      });

      if (mineral.length == 0) {
        return await interaction.reply({
          content: `No mineral found with this name: ${mineralName}`,
          ephemeral: true,
        });
      }

      mineral.active = false;
      await mineral.save();
      return await interaction.reply({
        content: `Mineral (${mineralName}) has been removed`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
