const {
  ModalBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
} = require("discord.js");

const Mineral = require("../../db/models/mineral");
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("findmineral")
    .setDescription("Find who has the mineral you are looking for."),
  async execute(interaction) {
    const minerals = await Mineral.find({ active: true });

    if (minerals.length === 0) {
      return await interaction.reply({
        content: "No minerals in the list.",
        ephemeral: true,
      });
    }

    const mineralSelect = new StringSelectMenuBuilder()
      .setCustomId("mineral-get-select")
      .setPlaceholder("Mineral name")
      .addOptions(
        minerals.map((mineral) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(mineral.name)
            .setValue(mineral._id.toString()),
        ),
      );

    const row = new ActionRowBuilder().addComponents(mineralSelect);

    log(`User ${interaction.user.username} initiated find mineral select`);
    await interaction.reply({
      content: "Select a mineral",
      components: [row],
    });
  },
};
