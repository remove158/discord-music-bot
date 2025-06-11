import { ActivityType, Events } from "discord.js";
import { Client, Discord, On, type ArgsOf } from "discordx";
import { LavaPlayerManager } from "../core/manager";

@Discord()
class OnClientReady {
  @On({ event: Events.ClientReady })
  async handle(
    [message]: ArgsOf<Events.ClientReady>, // Type message automatically
    client: Client, // Client instance injected here,
    guardPayload: any
  ) {
    await client.initApplicationCommands();
    client.user?.setActivity({
      name: "Ready to use!",
      type: ActivityType.Listening,
    });
    await LavaPlayerManager.initLavalink(client);
  }
}
