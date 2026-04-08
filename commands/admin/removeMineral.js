const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removemineral")
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
      return await interaction.followUp({
        content: "Mineral name is required",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const mineral = await Mineral.findOne({
        name: mineralName,
      });

      if (mineral.length == 0) {
        return await interaction.followUp({
          content: `No mineral found with this name: ${mineralName}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      mineral.active = false;
      await mineral.save();
      return await interaction.followUp({
        content: `Mineral (${mineralName}) has been removed`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
