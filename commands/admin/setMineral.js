const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const Mineral = require("../../db/models/mineral");
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmineral")
    .setDescription("(Admin) Add a new mineral to the list of minerals")
    .addStringOption((option) =>
      option
        .setName("mineral-name")
        .setDescription("The name of the mineral to add"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator),
  async execute(interaction) {
    const mineralName = interaction.options.getString("mineral-name");

    if (!mineralName) {
      return await interaction.reply({
        content: "Mineral name is required!",
        ephemeral: true,
      });
    }

    try {
      const existingMineral = await Mineral.findOne({ name: mineralName });
      if (existingMineral && existingMineral.active) {
        return await interaction.reply({
          content: `The mineral (${mineralName}) already exists`,
          ephemeral: true,
        });
      } else if (existingMineral && !existingMineral.active) {
        existingMineral.active = true;
        await existingMineral.save();

        log(
          `Admin ${interaction.user.username} reactivated mineral: ${mineralName}`,
        );
        return await interaction.reply({
          content: "Mineral has been added to the list",
          ephemeral: true,
        });
      }

      const mineral = new Mineral({
        name: mineralName,
      });

      await mineral.save();
      log(
        `Admin ${interaction.user.username} added new mineral: ${mineralName}`,
      );
      return await interaction.reply({
        content: "Mineral has been added to the list",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      log(`[ERROR] Failed to set mineral ${mineralName}: ${error.message}`);
    }
  },
};
