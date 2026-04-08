const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Mineral = require("../../db/models/mineral");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getminerallist")
    .setDescription("Get the list of minerals")
    .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator),
  async execute(interaction) {
    try {
      const minerals = await Mineral.find();
      console.log("Minerals: ", minerals);
    } catch (error) {
      console.error(error);
    }
  },
};
