const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const Mineral = require("../db/models/mineral.js");

module.exports = {
    customId: "inventory-pagination",

    async execute(interaction) {
        const session = interaction.client.inventoryPages?.get(interaction.user.id);
        if (!session || session.expires < Date.now()) {
            return interaction.reply({ content: "Session expired. Run the command again.", ephemeral: true });
        }

        let { pages, currentPage, mineralId } = session;

        // Update page
        if (interaction.customId === "inventory-next") currentPage++;
        if (interaction.customId === "inventory-prev") currentPage--;

        currentPage = Math.max(0, Math.min(currentPage, pages.length - 1));
        session.currentPage = currentPage;

        const mineral = await Mineral.findById(mineralId);

        const embed = new EmbedBuilder()
            .setColor(0x23272a)
            .setTitle(`Mineral List - Page ${currentPage + 1}/${pages.length}`)
            .setDescription(`Mineral: ${mineral.name}`)
            .addFields(pages[currentPage])
            .setTimestamp()
            .setFooter({ text: "Made by: Anrazzi" });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("inventory-prev")
                .setLabel("⬅ Prev")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId("inventory-next")
                .setLabel("Next ➡")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === pages.length - 1)
        );

        await interaction.update({ embeds: [embed], components: [buttons] });
    },
};