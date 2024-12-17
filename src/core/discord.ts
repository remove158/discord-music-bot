import { dirname, importx } from "@discordx/importer";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import { envConfig } from "../env";
import { LavaPlayerManager } from "./manager";
import { MessageHelper } from "../utils/message-embed";

export class Bot {
  private static _client: Client;
  private static _manager: LavaPlayerManager;

  static get Client(): Client {
    return this._client;
  }

  static get Manager(): LavaPlayerManager {
    return this._manager;
  }

  static async start(): Promise<void> {
    this._client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
      silent: true,
    });

    this._manager = new LavaPlayerManager(this._client);

    this._client.on("interactionCreate", (interaction) => {
      MessageHelper.listenOwner(interaction)
      this._client.executeInteraction(interaction);
    });

    await importx(`${dirname(import.meta.url)}/../commands/**/*.{js,ts}`);

    await this._client.login(envConfig.DISCORD_TOKEN);
  }
}