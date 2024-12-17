import { EmbedBuilder } from "@discordjs/builders";
import { randomUUIDv7 } from "bun";
import type {
  AutocompleteInteraction,
  CacheType,
  CommandInteraction,
  Interaction,
  RepliableInteraction,
  User,
} from "discord.js";
import { envConfig } from "../env";

const COLOR = 0xf29fbb;
const SILENT_FLAGS = [4096] as any;

export class MessageHelper {
  private static _owner: User;
  static createEmbed = (
    title: string,
    description: string | Array<unknown>
  ) => {
    let content =
      typeof description === "string"
        ? description
        : description
            .filter((e) => typeof e === "string" && e !== "")
            .join("\n");
    return new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(title)
      .setDescription(content.slice(0, 4096));
  };
  static replySilent = async (
    interaction: RepliableInteraction<CacheType>,

    embded: EmbedBuilder
  ) => await interaction.reply({ embeds: [embded], flags: SILENT_FLAGS });

  static listenOwner = async (interaction: Interaction<CacheType>) => {
    if (envConfig.OWNER_USERNAME === interaction.user.username)
      this._owner = interaction.user;
  };

  static handleError = async (
    interaction: CommandInteraction | AutocompleteInteraction,
    content: unknown,
    error: unknown,
  ) => {
    if (interaction.isRepliable()) {
      const embded = this.createEmbed("❌ something went wrong", [
        `> **TraceId:** \`${interaction.id}\``,
        `> **Command:** \`${interaction.commandName}\``,
        `> **Content:** \`${content}\``,
      ]);
      await this.replySilent(interaction, embded);
    }
    this.sendErrorToOwner(interaction, content, error)
  };

  static sendErrorToOwner = async (
    interaction: CommandInteraction | AutocompleteInteraction,
    content: unknown,
    error: unknown,
  ) => {
    const embded = this.createEmbed("❌ something went wrong", [
      `> **TraceId:** \`${interaction.id}\``,
      `> **Command:** \`${interaction.commandName}\``,
      `> **Content:** \`${content}\``,
      `> **Errorr:** \`${String(error)}\``,
      `> **Requestor:** \`${interaction.user.globalName} (${interaction.user.username})\``,
    ]);
    if (this?._owner?.send) {
      this._owner.send({ embeds: [embded] });
    }
  };
}
