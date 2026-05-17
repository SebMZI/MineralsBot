import { Discord, Slash } from "discordx";
import { CommandInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { Pagination } from "@discordx/pagination";
import Mineral from "../../db/models/mineral.js";

@Discord()
export class FindMineral {
  @Slash({ name: "findmineral", description: "Find who has the mineral you are looking for." })
  async find(interaction) {
    const minerals = await Mineral.find({ active: true }).populate("owners.user");
    if (!minerals.length) {
      await interaction.reply({ content: "No minerals in the list.", ephemeral: true });
      return;
    }

    const pages = minerals.map((m) => {
      const ownersText = m.owners?.length
          ? m.owners.map(o => `${o.user.username}: ${o.amount}`).join("\n")
          : "No owners";
      return {
        embeds: [
          new EmbedBuilder()
              .setTitle(m.name)
              .setDescription(`Mineral ID: ${m._id}`)
              .addFields({ name: "Owners", value: ownersText })
        ],
      };
    });


    const pagination = new Pagination(interaction, pages, {
      time: 5 * 60_000, // 5 minutes
      buttons: {
        backward: { style: ButtonStyle.Secondary, label: "⬅ Prev" },
        forward: { style: ButtonStyle.Secondary, label: "Next ➡" },
      },
    });

    await pagination.send();
  }
}