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
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addmineral")
    .setDescription("(Press Enter) Add a mineral to your inventory"),
  async execute(interaction) {
    const minerals = await Mineral.find({ active: true });
    if (minerals.length === 0) {
      return interaction.reply({
        content: "No minerals in the list.",
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("mineral-add-modal")
      .setTitle("Add a mineral");

    const mineralSelect = new StringSelectMenuBuilder()
      .setCustomId("mineralSelect")
      .setPlaceholder("Choose a mineral")
      .setRequired(true)
      .addOptions(
        minerals.map((mineral) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(mineral.name)
            .setValue(mineral._id.toString()),
        ),
      );

    const mineralLabel = new LabelBuilder()
      .setLabel("Mineral")
      .setDescription("Choose the mineral you want to add")
      .setStringSelectMenuComponent(mineralSelect);

    const quantityInput = new TextInputBuilder()
      .setCustomId("quantity")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("ex: 10")
      .setRequired(true);

    const quantityLabel = new LabelBuilder()
      .setLabel("Quantity")
      .setTextInputComponent(quantityInput);

    const qualityInput = new TextInputBuilder()
      .setCustomId("quality")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Quality: 0 - 1000")
      .setRequired(true);

    const qualityLabel = new LabelBuilder()
      .setLabel("Quality")
      .setTextInputComponent(qualityInput);

    modal.addLabelComponents(mineralLabel, quantityLabel, qualityLabel);

    log(`User ${interaction.user.username} initiated add mineral modal`);
    await interaction.showModal(modal);
  },
};
