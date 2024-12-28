import {
  LavalinkManager,
  parseLavalinkConnUrl,
  Player,
  type SearchResult,
  type Track,
} from "lavalink-client";
import { envConfig } from "../env";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  TextChannel,
  type AutocompleteInteraction,
  type CacheType,
  type CommandInteraction,
  type GuildMember,
  type Interaction,
  type MessageActionRowComponentBuilder,
  type VoiceChannel,
} from "discord.js";
import type { Client } from "discordx";
import { randomUUIDv7 } from "bun";
import type { CustomRequester } from "../types";
import { MessageHelper, SILENT_FLAGS } from "../utils/message-embed";
import { formatMS_HHMMSS } from "../utils/format";

const LavalinkNodesOfEnv = envConfig.LAVALINK_NODES.split(" ")
  .filter((v) => v.length)
  .map((url) => parseLavalinkConnUrl(url));

export class LavaPlayerManager {
  private static _lavalink: LavalinkManager;
  private static _client: Client;
  private static autocomplete: Map<string, SearchResult> = new Map();
  private static action: Map<
    string,
    { url: string | undefined; track: Track | null }
  > = new Map();
  private static autocomplteTimeout = new Map();

  static async initLavalink(client: Client) {
    this._client = client;
    this._lavalink = new LavalinkManager({
      nodes: LavalinkNodesOfEnv,
      sendToShard: (guildId, payload) =>
        this._client.guilds.cache.get(guildId)?.shard?.send(payload),
      client: {
        id: envConfig.CLIENT_ID,
      },
      playerOptions: {
        onDisconnect: {
          autoReconnect: true,
        },
        onEmptyQueue: {
          destroyAfterMs: 300_000,
          // autoPlayFunction: autoPlayFunction(client)
        },
      },
    });
    await this._lavalink.init({ ...client.user!, shards: "auto" }); //VERY IMPORTANT!

    this._client.on(Events.Raw, (d) => this._lavalink.sendRawData(d));
    this.onTrackStart();
  }

  static onTrackStart() {
    this._lavalink.on("trackStart", (player, track) => {
      const avatarURL =
        (track?.requester as CustomRequester)?.avatar || undefined;

      const embded = MessageHelper.createEmbed({
        title: `🎶 ${track?.info?.title}`.substring(0, 256),
        description: [
          `> - **Author:** ${track?.info?.author}`,
          `> - **Duration:** ${formatMS_HHMMSS(
            track?.info?.duration || 0
          )} | Ends <t:${Math.floor(
            (Date.now() + (track?.info?.duration || 0)) / 1000
          )}:R>`,
          `> - **Source:** ${track?.info?.sourceName}`,
          `> - **Requester:** <@${(track?.requester as CustomRequester)?.id}>`,
          track?.pluginInfo?.clientData?.fromAutoplay
            ? `> *From Autoplay* ✅`
            : undefined,
        ],
      });
      const PlayButton = new ButtonBuilder()
        .setLabel("▶")
        .setStyle(ButtonStyle.Success)
        .setCustomId(
          LavaPlayerManager.createButtonActionId(track, ButtonActions.PLAY)
        );

      const SkipButton = new ButtonBuilder()
        .setLabel("▶|")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(
          LavaPlayerManager.createButtonActionId(track, ButtonActions.SKIP)
        );

      const PauseButton = new ButtonBuilder()
        .setLabel("◼")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(
          LavaPlayerManager.createButtonActionId(track, ButtonActions.SKIP)
        );

      const buttonRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          PlayButton,
          SkipButton,
          PauseButton
        );

      // some tracks might have a "uri" which is not a valid http url (e.g. spotify local, files, etc.)
      if (track?.info?.uri && /^https?:\/\//.test(track?.info?.uri))
        embded.setURL(track.info.uri);

      const channel = this._client.channels.cache.get(
        player.textChannelId!
      ) as TextChannel;
      if (!channel) return;

      return channel.send({
        embeds: [embded],
        components: [buttonRow],
        flags: SILENT_FLAGS,
      });
    });
  }

  static getPlayer(interaction: Interaction<CacheType>) {
    const params = this.getPlayerParams(interaction);

    return (
      this._lavalink.getPlayer(params.guildId) ||
      this._lavalink.createPlayer({
        guildId: params.guildId,
        voiceChannelId: params.voiceChannelId,
        textChannelId: params.textChannelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100, // default volume
        instaUpdateFiltersFix: true, // optional
        applyVolumeAsFilter: true, // if true player.setVolume(54) -> player.filters.setVolume(0.54)
      })
    );
  }

  static getPlayerParams(interaction: Interaction<CacheType>) {
    const vcId = (interaction.member as GuildMember)?.voice?.channelId;
    if (!vcId) throw new Error("You are not in a voice channel");
    const vc = (interaction.member as GuildMember)?.voice
      ?.channel as VoiceChannel;
    if (!vc.joinable || !vc.speakable)
      throw new Error("Unable to join your channel");
    return {
      guildId: interaction.guildId ?? "",
      textChannelId: interaction.channelId ?? "",
      voiceChannelId: vcId,
    };
  }

  static async getConnectedPlayer(interaction: Interaction<CacheType>) {
    const player = this.getPlayer(interaction);
    if (player.connected) await player.connect();
    return player;
  }

  static setAutocompleteCache(
    interaction: AutocompleteInteraction<CacheType>,
    searchResult: SearchResult
  ) {
    const timeoutKey = this.createTimeoutKey(interaction);
    const responseKey = this.createResponseKey(interaction);

    if (this.autocomplteTimeout.has(timeoutKey))
      clearTimeout(this.autocomplteTimeout.get(timeoutKey));
    this.autocomplete.set(responseKey, searchResult);
    this.autocomplteTimeout.set(
      timeoutKey,
      setTimeout(() => {
        this.autocomplete.delete(responseKey);
        this.autocomplteTimeout.delete(timeoutKey);
      }, 25_000)
    );
  }
  static createTimeoutKey(interaction: Interaction<CacheType>) {
    return `${interaction.user.id}_timeout`;
  }

  static createResponseKey(interaction: Interaction<CacheType>) {
    return `${interaction.user.id}_res`;
  }

  static getAutoCompleteSearchResult(
    interaction: Interaction<CacheType>,
    message: string
  ) {
    const timeoutKey = this.createTimeoutKey(interaction);
    const responseKey = this.createResponseKey(interaction);

    const fromAutoComplete =
      Number(message.replace("autocomplete_", "")) >= 0 &&
      this.autocomplete.has(responseKey) &&
      this.autocomplete.get(responseKey);
    if (this.autocomplete.has(responseKey)) {
      if (this.autocomplteTimeout.has(timeoutKey))
        clearTimeout(this.autocomplteTimeout.get(timeoutKey));
      this.autocomplete.delete(responseKey);
      this.autocomplteTimeout.delete(timeoutKey);
    }
    return fromAutoComplete || null;
  }

  static createButtonActionId(
    track: Track,
    action: (typeof ButtonActions)[keyof typeof ButtonActions]
  ) {
    const uuid = randomUUIDv7();
    const key = `${action}:${uuid}`;
    this.action.set(key, {
      track: track,
      url: track.info.uri,
    });
    setTimeout(() => {
      this.action.set(key, {
        track: null,
        url: track.encoded,
      });
    }, 60_000 * 10);
    return key;
  }

  static async getTrackFromAction(key: string, guildId: string) {
    const cache = this.action.get(key);
    if (cache?.track) return cache.track;
    if (cache?.url) {
      const player = this._lavalink.getPlayer(guildId);
      if (!player) return null;
      const searchResult = await player.search(cache.url, {});
      if (!searchResult.tracks.length) return null;
      const track = searchResult.tracks[0];
      return track as Track;
    }
    return null;
  }
}

export const ButtonActions = {
  PLAY: "play",
  SKIP: "skip",
} as const;
