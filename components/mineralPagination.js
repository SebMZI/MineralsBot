const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    customId: "mineral-page",

    async execute(interaction) {
        try {
            const session = interaction.client.mineralPages?.get(interaction.user.id);

            if (!session || session.expires < Date.now()) {
                return interaction.reply({
                    content: "Session expired. Run /findmineral again.",
                    ephemeral: true,
                });
            }

            // Parse page and action safely
            const custom = interaction.customId;
            let page = parseInt(custom.split("-").pop());
            let action = custom.includes("next") ? "next" : custom.includes("prev") ? "prev" : null;

            if (action === "next") page++;
            if (action === "prev") page--;

            const pages = session.pages;

            // Clamp page
            page = Math.max(0, Math.min(page, pages.length - 1));

            const current = pages[page];

            // Build menu
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`mineral-page-${page}`)
                .setPlaceholder(`Select mineral (Page ${page + 1}/${pages.length})`)
                .addOptions(
                    current.map((m) => ({
                        label: m.name,
                        value: m._id.toString(),
                    }))
                );

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mineral-prev-${page}`)
                    .setLabel("⬅ Prev")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId(`mineral-next-${page}`)
                    .setLabel("Next ➡")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === pages.length - 1)
            );

            await interaction.update({
                components: [new ActionRowBuilder().addComponents(menu), buttons],
            });
        } catch (err) {
            console.error(err);
            if (!interaction.replied)
                await interaction.reply({ content: "Something went wrong.", ephemeral: true });
        }
    },
};