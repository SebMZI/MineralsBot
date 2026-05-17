const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
} = require("discord.js");
const Mineral = require("../../db/models/mineral");
const log = require("../../utils/logs.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wipeminerals")
        .setDescription("(Admin) Wipe all minerals from players")
        .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator),
    async execute(interaction) {
        try {
            const minerals = await Mineral.find();
            if(!minerals || minerals?.length === 0) return await interaction.reply({
                content: "No player's minerals to delete",
                ephemeral: true,
            });

            await Mineral.deleteMany()

            return await interaction.reply({
                content: "All minerals has been deleted",
                ephemeral: true,
            });

        } catch (error) {
            console.error(error);
            log(`[ERROR] Failed to wipe minerals: ${error.message}`);
            return await interaction.reply({
                content: "Failed to wipe minerals",
                ephemeral: true,
            });
        }
    },
};
