import {  Events } from "discord.js";
import { Bot, Client, Discord, On, Once, type ArgsOf } from "discordx";
import { LavaPlayerManager } from "../core/manager";

@Discord()
class OnInteractionCreate {
  @On({ event: Events.InteractionCreate })
  async handle(
    [message]: ArgsOf<Events.InteractionCreate>, // Type message automatically
    client: Client, // Client instance injected here,
    guardPayload: any,
  ) {
    client.executeInteraction(message)
  }
}