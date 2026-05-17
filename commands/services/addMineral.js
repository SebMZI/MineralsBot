const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { Pagination } = require("@discordx/pagination");
const Mineral = require("../../db/models/mineral.js");
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("addmineral")
      .setDescription("Add a mineral to your inventory."),

  async execute(interaction) {
    const minerals = await Mineral.find({ active: true });

    if (!minerals.length) {
      return interaction.reply({
        content: "No minerals in the list.",
        ephemeral: true,
      });
    }

    const pageSize = 10;
    const totalPages = Math.ceil(minerals.length / pageSize);
    const pages = [];

    for (let i = 0; i < minerals.length; i += pageSize) {
      const pageMinerals = minerals.slice(i, i + pageSize);
      const currentPage = Math.floor(i / pageSize) + 1;

      const menu = new StringSelectMenuBuilder()
          .setCustomId("add-mineral-select")
          .setPlaceholder(`Select a mineral (${currentPage}/${totalPages})`)
          .addOptions(
              pageMinerals.map((mineral) => ({
                label: mineral.name.slice(0, 100),
                value: mineral._id.toString(),
              }))
          );

      pages.push({
        content: "Select a mineral to add:",
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    const pagination = new Pagination(interaction, pages, {
      time: 5 * 60_000,
      buttons: {
        backward: { style: ButtonStyle.Secondary, label: "⬅ Prev" },
        forward: { style: ButtonStyle.Secondary, label: "Next ➡" },
      },
    });

    await pagination.send();

    await log(`User ${interaction.user.username} opened add mineral selector`);

    const filter = (selectInteraction) =>
        selectInteraction.isStringSelectMenu() &&
        selectInteraction.customId === "add-mineral-select" &&
        selectInteraction.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 5 * 60_000,
    });

    collector.on("collect", async (selectInteraction) => {
      const mineralId = selectInteraction.values[0];

      const mineral = await Mineral.findById(mineralId);

      if (!mineral) {
        return selectInteraction.reply({
          content: "Mineral not found.",
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
          .setCustomId(`mineral-add-modal:${mineralId}`)
          .setTitle(`Add ${mineral.name.slice(0, 35)}`);

      const quantityInput = new TextInputBuilder()
          .setCustomId("quantity")
          .setLabel("Quantity")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("ex: 10")
          .setRequired(true);

      const qualityInput = new TextInputBuilder()
          .setCustomId("quality")
          .setLabel("Quality")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("0 - 1000")
          .setRequired(true);

      const quantityRow = new ActionRowBuilder().addComponents(quantityInput);
      const qualityRow = new ActionRowBuilder().addComponents(qualityInput);

      modal.addComponents(quantityRow, qualityRow);

      await selectInteraction.showModal(modal);
    });
  },
};