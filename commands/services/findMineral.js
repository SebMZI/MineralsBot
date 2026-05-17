const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Pagination } = require("@discordx/pagination");
const Mineral = require("../../db/models/mineral.js");
const UserMineral = require("../../db/models/userMineral.js"); // modèle qui relie utilisateur et minéral

module.exports = {
  data: new SlashCommandBuilder()
      .setName("findmineral")
      .setDescription("Find who has the mineral you are looking for."),

  async execute(interaction) {
    // Récupère tous les minerais actifs
    const minerals = await Mineral.find({ active: true });
    if (!minerals.length) {
      return interaction.reply({ content: "No minerals in the list.", ephemeral: true });
    }

    // Pagination : 10 minerais par page
    const pageSize = 10;
    const pages = [];
    for (let i = 0; i < minerals.length; i += pageSize) {
      const pageMinerals = minerals.slice(i, i + pageSize);
      // Transforme en select menu + embed pour DiscordX Pagination
      const menu = new StringSelectMenuBuilder()
          .setCustomId("mineral-select")
          .setPlaceholder(`Select a mineral (Page ${Math.floor(i / pageSize) + 1}/${Math.ceil(minerals.length / pageSize)})`)
          .addOptions(
              pageMinerals.map(m => ({
                label: m.name,
                value: m._id.toString()
              }))
          );

      pages.push({
        content: "Select a mineral from the list below:",
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    // Crée la pagination
    const pagination = new Pagination(interaction, pages, {
      time: 5 * 60_000, // 5 minutes
      buttons: {
        backward: { style: ButtonStyle.Secondary, label: "⬅ Prev" },
        forward: { style: ButtonStyle.Secondary, label: "Next ➡" },
      }
    });

    await pagination.send();

    // Écoute les selects sur cette interaction
    interaction.client.on("interactionCreate", async selectInteraction => {
      if (!selectInteraction.isStringSelectMenu()) return;
      if (selectInteraction.customId !== "mineral-select") return;
      if (selectInteraction.user.id !== interaction.user.id) {
        return selectInteraction.reply({ content: "This menu is not for you.", ephemeral: true });
      }

      const mineralId = selectInteraction.values[0];
      const mineral = await Mineral.findById(mineralId);
      if (!mineral) return selectInteraction.reply({ content: "Mineral not found.", ephemeral: true });

      // Cherche qui possède ce minéral
      const owners = await UserMineral.find({ mineral: mineralId }).populate("user");
      if (!owners.length) return selectInteraction.reply({ content: "Nobody owns this mineral.", ephemeral: true });

      const description = owners.map(o => `• ${o.user.username}`).join("\n");
      const embed = new EmbedBuilder()
          .setTitle(`Owners of ${mineral.name}`)
          .setDescription(description);

      await selectInteraction.reply({ embeds: [embed], ephemeral: true });
    });
  }
};