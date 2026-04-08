const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
  async execute(interaction) {},
};
