import { randomUUIDv7 } from "bun";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { LavaPlayerManager } from "../core/manager";
import type { Player } from "lavalink-client/dist/types";

export const ButtonActions = {
  RESUME: "resume",
  PAUSE: "pause",
  SKIP: "skip",
  DESTORY: "destory",
} as const;

@Discord()
class ButtonHandlers {
  async getPlayer(interaction: ButtonInteraction): Promise<Player | undefined> {
    const player = await LavaPlayerManager.getConnectedPlayer(interaction);
    if (!player) {
      interaction.reply({
        ephemeral: true,
        content: "I'm not connected",
      });
      return;
    }
    if (!player.playing) {
      interaction.reply({
        ephemeral: true,
        content: "Nothing is playing",
      });
      return;
    }
    return player;
  }

  @ButtonComponent({ id: RegExp(ButtonActions.RESUME) })
  async resumeHandler(interaction: ButtonInteraction): Promise<any> {
    const player = await this.getPlayer(interaction);
    if (!player) return;
    await player.resume();
    const message = LavaPlayerManager.getLatestControllerMessage(
      interaction.guildId ?? ""
    );
    if (message?.editable) {
      const buttonRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          pauseButton,
          skipButton,
          destoryButton
        );
      await message.edit({
        components: [buttonRow],
      });
    }

    await interaction.deferUpdate({});
  }

  @ButtonComponent({ id: RegExp(ButtonActions.PAUSE) })
  async pauseHandler(interaction: ButtonInteraction): Promise<any> {
    const player = await this.getPlayer(interaction);
    if (!player) return;
    await player.pause();
    const message = LavaPlayerManager.getLatestControllerMessage(
      interaction.guildId ?? ""
    );
    if (message?.editable) {
      const buttonRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          resumeButton,
          skipButton,
          destoryButton
        );
      await message.edit({
        components: [buttonRow],
      });
    }
    await interaction.deferUpdate({});
  }

  @ButtonComponent({ id: RegExp(ButtonActions.SKIP) })
  async skipHandler(interaction: ButtonInteraction): Promise<any> {
    const player = await this.getPlayer(interaction);
    if (!player) return;
    await player.skip(0, false);
    interaction.reply({ ephemeral: true, content: "Skipped" });
  }

  @ButtonComponent({ id: RegExp(ButtonActions.DESTORY) })
  async destroyPlayer(interaction: ButtonInteraction): Promise<any> {
    const player = await this.getPlayer(interaction);
    if (!player) return;
    await player.destroy();
    const message = LavaPlayerManager.getLatestControllerMessage(
      interaction.guildId ?? ""
    );
    if (message?.editable)
      await message.edit({
        components: [],
      });
    interaction.reply({ ephemeral: true, content: "Stopped" });
  }
}

const createButtonActionId = (
  action: (typeof ButtonActions)[keyof typeof ButtonActions]
) => {
  return action;
};

export const resumeButton = new ButtonBuilder()
  .setLabel("▶")
  .setStyle(ButtonStyle.Success)
  .setCustomId(createButtonActionId(ButtonActions.RESUME));

export const pauseButton = new ButtonBuilder()
  .setLabel("⏸")
  .setStyle(ButtonStyle.Secondary)
  .setCustomId(createButtonActionId(ButtonActions.PAUSE));

export const skipButton = new ButtonBuilder()
  .setLabel("⏯")
  .setStyle(ButtonStyle.Secondary)
  .setCustomId(createButtonActionId(ButtonActions.SKIP));

export const destoryButton = new ButtonBuilder()
  .setLabel("◼")
  .setStyle(ButtonStyle.Secondary)
  .setCustomId(createButtonActionId(ButtonActions.DESTORY));
