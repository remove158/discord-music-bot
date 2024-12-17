import { dirname, importx } from "@discordx/importer";
import { GatewayIntentBits, IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { envConfig } from "./env";

export class Main {
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

    this._client.once("ready", () => {
      void this._client.initApplicationCommands();

      console.log(">> Bot started");
    });

    this._client.on("interactionCreate", (interaction) => {
      this._client.executeInteraction(interaction);
    });

    await importx(`${dirname(import.meta.url)}/commands/**/*.{js,ts}`);

    await this._client.login(envConfig.DISCORD_TOKEN);
  }
}

void Main.start();
