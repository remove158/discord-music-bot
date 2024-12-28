import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { LavaPlayerManager } from "../core/manager";

@Discord()
class autoplay {
  @Slash({ description: "toggle autoplay", name: "autoplay" })
  async handleAutoplay(interaction: CommandInteraction): Promise<any> {
    interaction.deferReply();
    const autoplay = LavaPlayerManager.getAutoplay(interaction.guildId!);
    LavaPlayerManager.setAutoplay(interaction.guildId!, !autoplay);
    return interaction.followUp({
      ephemeral: true,
      content: `Autoplay: ${!autoplay}`,
    });
  }
}
