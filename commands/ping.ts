import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
class Example {
  @Slash({ description: "say hello", name: "ping" })
  hello(
    @SlashOption({
      description: "enter your greeting",
      name: "message",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    message: string,
    interaction: CommandInteraction,
  ): void {
    interaction.reply(`:wave: from ${interaction.user}: ${message}`);
  }
}