import {
  LavalinkManager,
  parseLavalinkConnUrl,
  type SearchResult,
} from "lavalink-client";
import { envConfig } from "../env";
import {
  Events,
  type AutocompleteInteraction,
  type CacheType,
  type CommandInteraction,
  type GuildMember,
  type Interaction,
  type VoiceChannel,
} from "discord.js";
import type { Client } from "discordx";

const LavalinkNodesOfEnv = envConfig.LAVALINK_NODES.split(" ")
  .filter((v) => v.length)
  .map((url) => parseLavalinkConnUrl(url));

export class LavaPlayerManager {
  private static _lavalink: LavalinkManager;
  private static _client: Client;
  private static autocomplete: Map<string, SearchResult> = new Map();
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
}
