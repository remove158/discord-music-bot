import { dirname, importx } from "@discordx/importer";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import { envConfig } from "../env";
import { LavaPlayerManager } from "./manager";

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
      silent: false,
    });

    this._manager = new LavaPlayerManager(this._client);

    this._client.once("ready", () => {
      void this._client.initApplicationCommands();

      this._manager.init();
      console.log(">> Bot started");
    });

    this._client.on("raw", (d) => {
      this.Manager.sendRaw(d)
    });

    this._client.on("interactionCreate", (interaction) => {
      this._client.executeInteraction(interaction);
    });

    await importx(`${dirname(import.meta.url)}/../commands/**/*.{js,ts}`);

    await this._client.login(envConfig.DISCORD_TOKEN);
  }
}