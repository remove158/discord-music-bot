import {  Events } from "discord.js";
import { Bot, Client, Discord, On, Once, type ArgsOf } from "discordx";
import { LavaPlayerManager } from "../core/manager";

@Discord()
class OnClientReady {
  @On({ event: Events.ClientReady })
  handle(
    [message]: ArgsOf<Events.ClientReady>, // Type message automatically
    client: Client, // Client instance injected here,
    guardPayload: any,
  ) {
    void client.initApplicationCommands()
    void LavaPlayerManager.initLavalink(client)
  }
}