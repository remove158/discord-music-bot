import { ButtonInteraction } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { LavaPlayerManager } from "../core/manager";
import { MessageHelper } from "../utils/message-embed";

@Discord()
class ButtonHandlers {
  @ButtonComponent({ id: RegExp("skip:*") })
  async skipHandler(interaction: ButtonInteraction): Promise<any> {
    const player = await LavaPlayerManager.getConnectedPlayer(interaction);
    if (!player)
      return interaction.reply({
        ephemeral: true,
        content: "I'm not connected",
      });
    if (!player.playing) {
      return interaction.reply({
        ephemeral: true,
        content: "Nothing is playing",
      });
    }
    await player.skip(0, false);
    await interaction.reply({
      content: "Skipped",
      ephemeral: true,
    });
  }

  @ButtonComponent({ id: RegExp("play:*") })
  async playHandler(interaction: ButtonInteraction): Promise<any> {
    const player = await LavaPlayerManager.getConnectedPlayer(interaction);
    if (!player)
      return interaction.reply({
        ephemeral: true,
        content: "I'm not connected",
      });

    const track = await LavaPlayerManager.getTrackFromAction(
      interaction.customId,
      interaction.guildId!
    );
    if (!track)
      return await interaction.reply({
        ephemeral: true,
        content: "Track not found",
      });

    if (!player.connected) await player.connect();
    await player.queue.add(track);
    if (!player.playing) await player.play();
    await MessageHelper.replySilent(
      interaction,
      MessageHelper.createEmbed({
        title: "ADDED TRACK",
        description: MessageHelper.createTrackInfo(track),
      })
    );
  }
}
