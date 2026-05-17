const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    customId: "mineral-page",

    async execute(interaction) {
        const session = interaction.client.mineralPages?.get(interaction.user.id);

        if (!session || session.expires < Date.now()) {
            return interaction.reply({
                content: "Session expired. Run /findmineral again.",
                ephemeral: true,
            });
        }

        let [, action, pageStr] = interaction.customId.split("-");
        let page = parseInt(pageStr);

        const pages = session.pages;

        // Clamp page to valid range
        page = Math.max(0, Math.min(page, pages.length - 1));

        const current = pages[page];

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
    },
};