import { LavalinkManager, parseLavalinkConnUrl } from "lavalink-client";
import { envConfig } from "../env";
import type { Client } from "discordx";
import type {
  AutocompleteInteraction,
  CommandInteraction,
  GuildMember,
  VoiceChannel,
} from "discord.js";

const LavalinkNodesOfEnv = envConfig.LAVALINK_NODES.split(" ")
  .filter((v) => v.length)
  .map((url) => parseLavalinkConnUrl(url));

export class LavaPlayerManager {
  private lavalink: LavalinkManager;
  private client: Client;
  constructor(client: Client) {
    this.client = client;
    this.lavalink = new LavalinkManager({
      nodes: LavalinkNodesOfEnv,
      sendToShard: (guildId, payload) =>
        this.client.guilds.cache.get(guildId)?.shard?.send(payload),
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

    this.client.on("raw", (d) => {
      this.lavalink.sendRawData(d);
    });

    this.client.once("ready", () => {
      void this.client.initApplicationCommands();
      this.lavalink.init({
        ...this.client.user!,
        shards: "auto",
      });
      console.log(">> Bot is ready!");
    });
  }

  sendRaw(d: any) {
    this.lavalink.sendRawData(d);
  }

  getPlayer(interaction: CommandInteraction | AutocompleteInteraction) {
    const params = this.getPlayerParams(interaction)
    const currentPlayer = this.lavalink.getPlayer(params.guildId);
    if (!currentPlayer)
      return this.lavalink.createPlayer({
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

  getPlayerParams(interaction: CommandInteraction | AutocompleteInteraction) {
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

  async connectPlayer(interaction: CommandInteraction | AutocompleteInteraction) {
    const player = this.getPlayer(interaction);
    if (player.connected) await player.connect();
    return player
  }
}
