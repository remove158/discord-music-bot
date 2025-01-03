import { EmbedBuilder } from "@discordjs/builders";
import { randomUUIDv7 } from "bun";
import type {
  CacheType,
  EmbedFooterOptions,
  Interaction,
  InteractionReplyOptions,
  RepliableInteraction,
  User,
} from "discord.js";
import type {
  Player,
  SearchResult,
  Track,
  UnresolvedTrack,
} from "lavalink-client/dist/types";
import { envConfig } from "../env";
import { formatMS_HHMMSS } from "./format";

const COLOR = 0xf29fbb;
export const SILENT_FLAGS = [4096] as any;

export class MessageHelper {
  private static _owner: User;
  static createEmbed = ({
    title,
    description,
    footer,
  }: {
    title?: string;
    description: string | Array<unknown>;
    footer?: EmbedFooterOptions;
  }) => {
    let content =
      typeof description === "string"
        ? description
        : description
            .filter((e) => typeof e === "string" && e !== "")
            .join("\n");
    return new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(title ?? null)
      .setDescription(content.slice(0, 4096))
      .setFooter(footer ?? null);
  };
  static replySilent = async (
    interaction: RepliableInteraction<CacheType>,
    embded: EmbedBuilder,
    components?: InteractionReplyOptions["components"]
  ) => {
    if (interaction.deferred) {
      await interaction.followUp({
        embeds: [embded],
        flags: SILENT_FLAGS,
        components: components,
      });
    } else {
      await interaction.reply({
        embeds: [embded],
        flags: SILENT_FLAGS,
        components: components,
      });
    }
  };

  static listenOwner = async (interaction: Interaction<CacheType>) => {
    if (envConfig.OWNER_USERNAME === interaction.user.username)
      this._owner = interaction.user;
  };

  static handleError = async (
    interaction: Interaction<CacheType>,
    content: unknown,
    error: unknown
  ) => {
    if (interaction.isAutocomplete()) {
      await interaction.respond([{ name: String(error).slice(7), value: "-" }]);
    }
    if (interaction.isRepliable()) {
      const embded = this.createEmbed({
        title: "❌ something went wrong",
        description: [
          `> **TraceId:** \`${interaction.id}\``,
          `> **Command:** \`${
            interaction.isCommand() ? interaction.commandName : "-"
          }\``,
          `> **Content:** \`${content}\``,
        ],
      });
      await this.replySilent(interaction, embded);
    }
    this.sendErrorToOwner(interaction, content, error);
  };

  static sendErrorToOwner = async (
    interaction: Interaction<CacheType>,
    content: unknown,
    error: unknown
  ) => {
    const embded = this.createEmbed({
      title: "❌ something went wrong",
      description: [
        `> **TraceId:** \`${interaction.id}\``,
        `> **Command:** \`${
          interaction.isCommand() ? interaction.commandName : "-"
        }\``,
        `> **Content:** \`${content}\``,
        `> **Errorr:** \`${String(error)}\``,
        `> **Requestor:** \`${interaction.user.globalName} (${interaction.user.username})\``,
      ],
    });
    if (this?._owner?.send) {
      this._owner.send({ embeds: [embded] });
    }
  };

  static createAddedResult(
    searchResult: SearchResult,
    player: Player,
    track: Track
  ) {
    return searchResult.loadType === "playlist"
      ? `✅ Added [${searchResult.tracks.length}] Tracks${
          searchResult.playlist?.title
            ? ` - from the ${searchResult.pluginInfo.type || "Playlist"} ${
                searchResult.playlist.uri
                  ? `[\`${searchResult.playlist.title}\`](<${searchResult.playlist.uri}>)`
                  : `\`${searchResult.playlist.title}\``
              }`
            : ""
        } at \`#${player.queue.tracks.length - searchResult.tracks.length}\``
      : this.createTrackInfo(track);
  }

  static createTrackInfo(track: Track) {
    return `Added [${track.info.title}](${
      track.info.uri
    }) - \`${formatMS_HHMMSS(track.info.duration)}\``;
  }

  static createOptions(searchResult: SearchResult) {
    return searchResult.loadType === "playlist"
      ? [
          {
            name: `Playlist [${searchResult.tracks.length} Tracks] - ${searchResult.playlist?.title}`,
            value: `autocomplete_0`,
          },
        ]
      : searchResult.tracks
          .map((t: Track | UnresolvedTrack, i) => ({
            name: `[${t.info.title} (by ${
              t.info.author || "Unknown-Author"
            })`.substring(0, 100),
            value: `autocomplete_${i}`,
          }))
          .slice(0, 25);
  }
}
