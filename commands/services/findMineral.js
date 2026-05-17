const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Mineral = require("../../db/models/mineral");
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("findmineral")
      .setDescription("Find who has the mineral you are looking for."),

  async execute(interaction) {
    try {
      const minerals = await Mineral.find({ active: true });
      if (!minerals.length) {
        return interaction.reply({
          content: "No minerals in the list.",
          ephemeral: true
        });
      }

      // Split into pages of 25
      const pages = [];
      for (let i = 0; i < minerals.length; i += 25) {
        pages.push(minerals.slice(i, i + 25));
      }

      // Store pages in memory with expiration (5 min)
      interaction.client.mineralPages ??= new Map();
      interaction.client.mineralPages.set(interaction.user.id, {
        pages,
        currentPage: 0,
        expires: Date.now() + 5 * 60 * 1000,
      });

      const current = pages[0];

      const menu = new StringSelectMenuBuilder()
          .setCustomId("mineral-select")
          .setPlaceholder(`Select mineral (Page 1/${pages.length})`)
          .addOptions(current.map(m => ({
            label: m.name,
            value: m._id.toString()
          })));

      const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setCustomId("mineral-select-prev")
              .setLabel("⬅ Prev")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
          new ButtonBuilder()
              .setCustomId("mineral-select-next")
              .setLabel("Next ➡")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(pages.length <= 1)
      );

      await log(`User ${interaction.user.username} opened mineral finder`);
      await interaction.reply({
        content: "Select a mineral:",
        ephemeral: true,
        components: [new ActionRowBuilder().addComponents(menu), buttons]
      });

    } catch (e) {
      console.error(e);
      await log(`Error in /findmineral: ${e.message}`).catch(console.error);
      if (!interaction.replied) {
        await interaction.reply({ content: "An error occurred.", ephemeral: true });
      }
    }
  },
};