import { dirname, importx } from "@discordx/importer";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import { envConfig } from "../env";
import { LavaPlayerManager } from "./manager";
import { MessageHelper } from "../utils/message-embed";

export class Bot {
  private static _client: Client;

  static get Client(): Client {
    return this._client;
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

    await importx(
      `${dirname(import.meta.url)}/../{commands,events}/**/*.{js,ts}`
    );
    await this._client.login(envConfig.DISCORD_TOKEN);
  }
}
