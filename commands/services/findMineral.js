const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const Mineral = require("../../db/models/mineral");
const log = require("../../utils/logs.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("findmineral")
      .setDescription("Find who has the mineral you are looking for."),

  async execute(interaction) {
    try {
      const minerals = await Mineral.find({ active: true });

      if (!minerals.length)
        return interaction.reply({
          content: "No minerals in the list.",
          ephemeral: true,
        });

      // split into pages of 25
      const pages = [];
      for (let i = 0; i < minerals.length; i += 25) {
        pages.push(minerals.slice(i, i + 25));
      }

      const buildMenu = (page) =>
          new StringSelectMenuBuilder()
              .setCustomId(`mineral-page-${page}`)
              .setPlaceholder(`Select mineral (Page ${page + 1}/${pages.length})`)
              .addOptions(
                  pages[page].map((m) => ({
                    label: m.name,
                    value: m._id.toString(),
                  }))
              );

      const buildButtons = (page) =>
          new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                  .setCustomId(`mineral-prev-${page}`)
                  .setLabel("⬅ Prev")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(page === 0),

              new ButtonBuilder()
                  .setCustomId(`mineral-next-${page}`)
                  .setLabel("Next ➡")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(page === pages.length - 1)
          );

      const page = 0;

      // Store pages in memory with expiration (5 min)
      interaction.client.mineralPages ??= new Map();
      interaction.client.mineralPages.set(interaction.user.id, {
        pages,
        expires: Date.now() + 5 * 60 * 1000,
      });

      await log(`User ${interaction.user.username} opened mineral finder`);

      await interaction.reply({
        content: "Select a mineral:",
        ephemeral: true, // <-- ephemeral ensures only the user sees it
        components: [new ActionRowBuilder().addComponents(buildMenu(page)), buildButtons(page)],
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