import { EmbedBuilder } from "@discordjs/builders";
import { randomUUIDv7 } from "bun";
import type { AutocompleteInteraction, CacheType, CommandInteraction, RepliableInteraction } from "discord.js";
import { isOwner } from "./permission";

const COLOR = 0xf29fbb;
const SILENT_FLAGS = [4096] as any;

export class MessageHelper {
  static createEmbed = (title: string, description: string | Array<unknown>) => {
    let content = typeof description === "string" ? description : description.filter( e=> typeof e === 'string' && e !== "").join("\n");
    return new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(title)
      .setDescription(content.slice(0, 4096));
  };
  static replySilent = async (
    interaction: RepliableInteraction<CacheType>,

    embded: EmbedBuilder
  ) => await interaction.reply({ embeds: [embded], flags: SILENT_FLAGS });

  static handleError = async (interaction: CommandInteraction | AutocompleteInteraction,content: any, error : unknown) => {
    const traceId = randomUUIDv7()
     if (interaction.isRepliable()) {
        const embded = this.createEmbed("❌ Something went wrong", 
          [
          `> **TraceId:** \`${traceId}\``,
          `> **Command:** \`${interaction.commandName}\``,
          `> **Content:** \`${content}\``,
          isOwner(interaction) && `> **Message:** \`${String(error)}\``
          ]);
        await this.replySilent(interaction, embded);
      }
  }
}
