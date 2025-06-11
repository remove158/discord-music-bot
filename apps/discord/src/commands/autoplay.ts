import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { LavaPlayerManager } from "../core/manager";
import { SILENT_FLAGS } from "../utils/message-embed";

@Discord()
class autoplay {
  @Slash({ description: "toggle autoplay", name: "autoplay" })
  async handleAutoplay(interaction: CommandInteraction): Promise<any> {
    await interaction.deferReply();
    const autoplay = LavaPlayerManager.getAutoplay(interaction.guildId!);
    LavaPlayerManager.setAutoplay(interaction.guildId!, !autoplay);
    return interaction.followUp({
      ephemeral: true,
      content: `Autoplay: \`${!autoplay ? "On" : "Off"}\``,
      flags: SILENT_FLAGS,
    });
  }
}
