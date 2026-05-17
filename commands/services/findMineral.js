const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");
const { Pagination } = require("@discordx/pagination");
const Mineral = require("../../db/models/mineral.js");
const Inventory = require("../../db/models/inventory.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("findmineral")
      .setDescription("Find who has the mineral you are looking for."),

  async execute(interaction) {
    const minerals = await Mineral.find({ active: true });
    if (!minerals.length) {
      return interaction.reply({ content: "No minerals in the list.", ephemeral: true });
    }

    const pageSize = 10;
    const pages = [];
    for (let i = 0; i < minerals.length; i += pageSize) {
      const pageMinerals = minerals.slice(i, i + pageSize);

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

    const pagination = new Pagination(interaction, pages, {
      time: 5 * 60_000,
      buttons: {
        backward: { style: ButtonStyle.Secondary, label: "⬅ Prev" },
        forward: { style: ButtonStyle.Secondary, label: "Next ➡" },
      }
    });

    await pagination.send();

    const filter = selectInteraction =>
        selectInteraction.isStringSelectMenu() &&
        selectInteraction.customId === "mineral-select" &&
        selectInteraction.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 5 * 60_000 });

    collector.on("collect", async (selectInteraction) => {
      const mineralId = selectInteraction.values[0];

      const mineral = await Mineral.findById(mineralId);

      if (!mineral) {
        return selectInteraction.reply({
          content: "Mineral not found.",
          ephemeral: true,
        });
      }

      const inventories = await Inventory.find({
        "minerals.mineralId": mineralId,
      });

      if (!inventories.length) {
        return selectInteraction.reply({
          content: "Nobody owns this mineral.",
          ephemeral: true,
        });
      }

      const description = inventories
          .map((inv) => {
            const member = interaction.guild.members.cache.get(inv.discordId);
            const username = member ? member.user.username : inv.discordId;

            const matchingMinerals = inv.minerals.filter(
                (min) => min.mineralId.toString() === mineralId
            );

            const mineralLines = matchingMinerals
                .map((min) => `x${min.quantity} (${min.quality})`)
                .join(", ");

            return `• ${username} - ${mineralLines}`;
          })
          .join("\n");

      const embed = new EmbedBuilder()
          .setTitle(`Owners of ${mineral.name}`)
          .setDescription(description || "Nobody owns this mineral.");

      await selectInteraction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    });
  }
};