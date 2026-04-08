const { EmbedBuilder } = require("discord.js");
const Inventory = require("../db/models/inventory.js");
const Mineral = require("../db/models/mineral.js");

// Helper function to convert quality number to readable name
function getQualityName(quality) {
  const qualities = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Epic",
    5: "Legendary",
  };
  return qualities[quality] || `Quality ${quality || "Unknown"}`;
}

module.exports = {
  customId: "mineral-get-select",
  async execute(interaction) {
    const mineralId = interaction.values[0];
    const filteredInventories = await Inventory.find({
      "minerals.mineralId": mineralId,
    });

    if (filteredInventories.length == 0) {
      return await interaction.reply({
        content: "No one has the mineral you are looking for .",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x23272a)
      .setTitle("Mineral List")
      .setTimestamp()
      .setFooter({
        text: "Made by: Anrazzi",
      });

    await Promise.all(
      filteredInventories.map(async (inventory, index) => {
        const member = await interaction.guild.members.fetch(
          inventory.discordId,
        );
        const userMinerals = inventory.minerals
          .filter((m) => m.mineralId == mineralId)
          .map((m) => `${getQualityName(m.quality)} (x${m.quantity})`);

        return {
          name: "\u200b",
          value: `${index + 1}. ${member.displayName} : ${userMinerals.join(", ")}`,
        };
      }),
    ).then((fields) => embed.addFields(fields));

    return await interaction.reply({ embeds: [embed] });
  },
};
