const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
} = require("discord.js");
const Inventory = require("../../db/models/inventory");
const log = require("../../utils/logs.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wipeinventories")
        .setDescription("(Admin) Wipe all player's inventory")
        .setDefaultMemberPermissions(PermissionFlagsBits?.Administrator),
    async execute(interaction) {
        try {
            const inventories = await Inventory.find();
            if(!inventories || inventories?.length === 0) return await interaction.reply({
                content: "No player's inventory to delete",
                ephemeral: true,
            });

            await Inventory.deleteMany()

            await log(`[DELETE] Deleted player's inventory`);
            return await interaction.reply({
                content: "All inventories have been deleted",
                ephemeral: true,
            });

        } catch (error) {
            console.error(error);
            await log(`[ERROR] Failed to wipe inventories: ${error.message}`);
            return await interaction.reply({
                content: "Failed to wipe inventories",
                ephemeral: true,
            });
        }
    },
};
