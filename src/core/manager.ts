import { LavalinkManager, parseLavalinkConnUrl } from "lavalink-client";
import { envConfig } from "../env";
import {
  Events,
  type AutocompleteInteraction,
  type CommandInteraction,
  type GuildMember,
  type VoiceChannel,
} from "discord.js";
import type { Client } from "discordx";

const LavalinkNodesOfEnv = envConfig.LAVALINK_NODES.split(" ")
  .filter((v) => v.length)
  .map((url) => parseLavalinkConnUrl(url));

export class LavaPlayerManager {
  private static _lavalink: LavalinkManager;
  private static _client: Client;

  static async initLavalink(client: Client) {
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
    await this._lavalink.init({...client.user!}) //VERY IMPORTANT!
  }

  static getPlayer(interaction: CommandInteraction | AutocompleteInteraction) {
    const params = this.getPlayerParams(interaction)
    const currentPlayer = this._lavalink.getPlayer(params.guildId);
    if (!currentPlayer)
      return this._lavalink.createPlayer({
        guildId: params.guildId,
        voiceChannelId: params.voiceChannel,
        textChannelId: params.textChannelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100, // default volume
        instaUpdateFiltersFix: true, // optional
        applyVolumeAsFilter: true, // if true player.setVolume(54) -> player.filters.setVolume(0.54)
      });
    return currentPlayer;
  }

  static getPlayerParams(interaction: CommandInteraction | AutocompleteInteraction) {
    const vcId = (interaction.member as GuildMember)?.voice?.channelId;
    if (!vcId) throw new Error("You are not in a voice channel");
    const vc = (interaction.member as GuildMember)?.voice
      ?.channel as VoiceChannel;
    if (!vc.joinable || !vc.speakable)
      throw new Error("Unable to join your channel");
    return {
      guildId: interaction.guildId ?? "",
      textChannelId: interaction.channelId ?? "",
      voiceChannel: vcId,
    };
  }

  static async getConnectedPlayer(interaction: CommandInteraction | AutocompleteInteraction) {
    const player = this.getPlayer(interaction);
    if (player.connected) await player.connect();
    return player
  }
}
