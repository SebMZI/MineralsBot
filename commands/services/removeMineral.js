const {
  ModalBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
} = require("discord.js");

const Mineral = require("../../db/models/mineral");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removemineral")
    .setDescription("(Press Enter) Remove a mineral from your inventory"),
  async execute(interaction) {
    const minerals = await Mineral.find({ active: true });
    if (minerals.length === 0) {
      return await interaction.reply({
        content: "No minerals in the list.",
        ephemeral: true,
      });
    }

    const mineralSelect = new StringSelectMenuBuilder()
      .setCustomId("mineral-remove-select")
      .setPlaceholder("Mineral name")
      .addOptions(
        minerals.map((mineral) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(mineral.name)
            .setValue(mineral._id),
        ),
      );

    const row = new ActionRowBuilder().addComponents(mineralSelect);

    await interaction.reply({
      content: "Select a mineral",
      components: [row],
    });
  },
};
