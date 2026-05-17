const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
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
      if (minerals.length === 0) {
        return await interaction.reply({
          content: "No minerals in the list.",
          ephemeral: true,
        });
      }

      // Discord only allows 25 options per select menu
      const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
        return chunks;
      };

      const mineralChunks = chunkArray(minerals, 25);

      const rows = mineralChunks.map((chunk, index) => {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`mineral-get-select-${index}`)
            .setPlaceholder("Select mineral")
            .addOptions(
                chunk.map((mineral) => ({
                  label: mineral.name,
                  value: mineral._id.toString(),
                }))
            );
        return new ActionRowBuilder().addComponents(menu);
      });

      await log(`User ${interaction.user.username} initiated find mineral select`);
      await interaction.reply({
        content: "Select a mineral",
        components: rows,
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