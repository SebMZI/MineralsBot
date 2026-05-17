const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Inventory = require("../db/models/inventory.js");
const Mineral = require("../db/models/mineral.js");
const log = require("../utils/logs.js");

module.exports = {
    customId: "mineral-get-select", // base handler

    async execute(interaction) {
        try {
            const mineralId = interaction.values[0];
            const mineral = await Mineral.findById(mineralId);
            if (!mineral)
                return interaction.reply({ content: "Mineral not found.", ephemeral: true });

            const inventories = await Inventory.find({ "minerals.mineralId": mineralId });
            if (!inventories.length)
                return interaction.reply({
                    content: "No one has this mineral.",
                    ephemeral: true,
                });

            // Build fields
            const fields = await Promise.all(
                inventories.map(async (inv, i) => {
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

            // Paginate fields (25 per page)
            const chunkArray = (arr, size) => {
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
                return chunks;
            };

            const pages = chunkArray(fields, 25);

            // Store per-user session
            interaction.client.inventoryPages ??= new Map();
            interaction.client.inventoryPages.set(interaction.user.id, {
                mineralId,
                pages,
                currentPage: 0,
                expires: Date.now() + 5 * 60 * 1000, // 5 min
            });

            // Send first page
            const embed = new EmbedBuilder()
                .setColor(0x23272a)
                .setTitle(`Mineral List - Page 1/${pages.length}`)
                .setDescription(`Mineral: ${mineral.name}`)
                .addFields(pages[0])
                .setTimestamp()
                .setFooter({ text: "Made by: Anrazzi" });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("inventory-prev")
                    .setLabel("⬅ Prev")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("inventory-next")
                    .setLabel("Next ➡")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pages.length <= 1)
            );

            await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
            await log(`User ${interaction.user.username} viewed mineral ${mineral.name}`);
        } catch (e) {
            console.error(e);
            await log(`Error in mineral-get-select: ${e.message}`).catch(console.error);
            if (!interaction.replied)
                await interaction.reply({ content: "An error occurred.", ephemeral: true });
        }
    },
};