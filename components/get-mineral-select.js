const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const Inventory = require("../db/models/inventory.js");
const Mineral = require("../db/models/mineral.js");
const log = require("../utils/logs.js");

module.exports = {
  customId: "mineral-get-select", // base ID
  async execute(interaction) {
    try {
      // Extract the base ID, in case it's mineral-get-select-0, -1, etc.
      const baseCustomId = interaction.customId.split("-").slice(0, 3).join("-");

      const mineralId = interaction.values[0];
      const mineral = await Mineral.findById(mineralId);
      if (!mineral) {
        await interaction.reply({ content: "Mineral not found.", ephemeral: true });
        return;
      }

      const filteredInventories = await Inventory.find({
        "minerals.mineralId": mineralId,
      });

      if (filteredInventories.length === 0) {
        await interaction.reply({
          content: "No one has the mineral you are looking for.",
          ephemeral: true,
        });
        return;
      }

      // Build fields for the embed
      const fields = await Promise.all(
          filteredInventories.map(async (inv, i) => {
            let member;
            try {
              member = await interaction.guild.members.fetch(inv.discordId, { force: true });
            } catch {
              member = { displayName: "Unknown Member" };
            }

            const userMinerals = inv.minerals
                .filter((m) => m.mineralId == mineralId)
                .map((m) => `x${m.quantity} (${m.quality})`);

            return { name: "\u200b", value: `${i + 1}. ${member.displayName}: ${userMinerals.join(", ")}` };
          })
      );

      // Discord embed limit: 25 fields per embed
      const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
        return chunks;
      };

      const embedChunks = chunkArray(fields, 25);

      // Pagination: we can only show one embed per interaction
      let currentPage = 0;

      const embed = new EmbedBuilder()
          .setColor(0x23272a)
          .setTitle(`Mineral List - Page ${currentPage + 1}/${embedChunks.length}`)
          .setDescription(`Mineral: ${mineral.name}`)
          .addFields(embedChunks[currentPage])
          .setTimestamp()
          .setFooter({ text: "Made by: Anrazzi" });

      await log(`User ${interaction.user.username} searched for mineral: ${mineral.name}`).catch(console.error);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      console.error(e);
      await log(`Error in mineral-get-select: ${e.message}`).catch(console.error);
      if (!interaction.replied) {
        await interaction.reply({ content: "An error occurred.", ephemeral: true });
      }
    }
  },
};