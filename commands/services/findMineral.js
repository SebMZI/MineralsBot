// commands/findMineral.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Pagination } = require("@discordx/pagination");
const Mineral = require("../../db/models/mineral.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("findmineral")
      .setDescription("Find who has the mineral you are looking for."),

  async execute(interaction) {
    const minerals = await Mineral.find({ active: true });
    if (!minerals.length) {
      return interaction.reply({ content: "No minerals in the list.", ephemeral: true });
    }

    // Crée les pages pour la pagination
    const pages = minerals.map((m) => ({
      embeds: [new EmbedBuilder().setTitle(m.name).setDescription(`Mineral ID: ${m._id}`)],
    }));

    // Pagination avec DiscordX Pagination
    const pagination = new Pagination(interaction, pages, {
      time: 5 * 60_000, // 5 minutes
      buttons: {
        backward: { style: 2, label: "⬅ Prev" },
        forward: { style: 2, label: "Next ➡" },
      },
    });

    await pagination.send();
  },
};