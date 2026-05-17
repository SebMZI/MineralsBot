const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  customId: "mineral-select",
  async execute(interaction) {
    try {
      const session = interaction.client.mineralPages?.get(interaction.user.id);
      if (!session || session.expires < Date.now()) {
        return interaction.reply({
          content: "Session expired. Run /findmineral again.",
          ephemeral: true
        });
      }

      let page = session.currentPage;

      // Handle button clicks
      if (interaction.isButton()) {
        if (interaction.customId === "mineral-select-prev") page--;
        if (interaction.customId === "mineral-select-next") page++;
      }

      // Clamp page
      page = Math.max(0, Math.min(page, session.pages.length - 1));
      session.currentPage = page;

      const currentPageData = session.pages[page];

      const menu = new StringSelectMenuBuilder()
          .setCustomId("mineral-select")
          .setPlaceholder(`Select mineral (Page ${page + 1}/${session.pages.length})`)
          .addOptions(currentPageData.map(m => ({
            label: m.name,
            value: m._id.toString()
          })));

      const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setCustomId("mineral-select-prev")
              .setLabel("⬅ Prev")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
          new ButtonBuilder()
              .setCustomId("mineral-select-next")
              .setLabel("Next ➡")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === session.pages.length - 1)
      );

      await interaction.update({
        components: [new ActionRowBuilder().addComponents(menu), buttons]
      });

    } catch (err) {
      console.error(err);
      if (!interaction.replied)
        await interaction.reply({ content: "Something went wrong.", ephemeral: true });
    }
  },
};