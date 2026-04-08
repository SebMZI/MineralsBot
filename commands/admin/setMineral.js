const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const Mineral = require("../../db/models/mineral");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmineral")
    .setDescription("Add a new mineral to the list of minerals")
    .addStringOption((option) =>
      option
        .setName("mineral-name")
        .setDescription("The name of the mineral to add"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator),
  async execute(interaction) {
    const mineralName = interaction.options.getString("mineral-name");
    await interaction.deferReply();

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

        return await interaction.reply({
          content: "Mineral has been added to the list",
          ephemeral: true,
        });
      }

      const mineral = new Mineral({
        name: mineralName,
      });

      await mineral.save();

      return await interaction.reply({
        content: "Mineral has been added to the list",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
