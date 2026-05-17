const { EmbedBuilder } = require("discord.js");
const Inventory = require("../db/models/inventory.js");
const Mineral = require("../db/models/mineral.js");
const log = require("../utils/logs.js");

module.exports = {
  customId: "mineral-get-select",

  async execute(interaction) {
    try {
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

      const embed = new EmbedBuilder()
          .setColor(0x23272a)
          .setTitle("Mineral List")
          .setDescription(`Mineral: ${mineral.name}`)
          .setTimestamp()
          .setFooter({ text: "Made by: Anrazzi" });

      const fields = await Promise.all(
          filteredInventories.map(async (inv, i) => {
            let member;
            try {
              member = await interaction.guild.members.fetch(inv.discordId);
            } catch {
              member = { displayName: "Unknown Member" };
            }

            const userMinerals = inv.minerals
                .filter((m) => m.mineralId == mineralId)
                .map((m) => `x${m.quantity} (${m.quality})`);

            return { name: "\u200b", value: `${i + 1}. ${member.displayName}: ${userMinerals.join(", ")}` };
          })
      );

      // Discord embed max 25 fields
      const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
        return chunks;
      };

      for (const chunk of chunkArray(fields, 25)) embed.addFields(chunk);

      await log(`User ${interaction.user.username} searched for mineral: ${mineral.name}`).catch(console.error);
      await interaction.reply({ embeds: [embed] });

    } catch (e) {
      console.error(e);
      await log(`Error in mineral-get-select: ${e.message}`).catch(console.error);
      if (!interaction.replied) {
        await interaction.reply({ content: "An error occurred.", ephemeral: true });
      }
    }
  },
};