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

      let { currentPage, pages } = session;

      // Handle buttons
      if (interaction.isButton()) {
        if (interaction.customId === "mineral-prev") currentPage--;
        if (interaction.customId === "mineral-next") currentPage++;
        // Clamp page
        currentPage = Math.max(0, Math.min(currentPage, pages.length - 1));
        session.currentPage = currentPage;
      }

      const currentData = pages[currentPage];

      // Build menu
      const menu = new StringSelectMenuBuilder()
          .setCustomId("mineral-select")
          .setPlaceholder(`Select mineral (Page ${currentPage + 1}/${pages.length})`)
          .addOptions(currentData.map(m => ({
            label: m.name,
            value: m._id.toString()
          })));

      // Build buttons
      const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setCustomId("mineral-prev")
              .setLabel("⬅ Prev")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === 0),
          new ButtonBuilder()
              .setCustomId("mineral-next")
              .setLabel("Next ➡")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === pages.length - 1)
      );

      await interaction.update({
        components: [new ActionRowBuilder().addComponents(menu), buttons]
      });
    } catch (err) {
      console.error(err);
      if (!interaction.replied)
        await interaction.reply({ content: "Something went wrong.", ephemeral: true });
    }
  }
};