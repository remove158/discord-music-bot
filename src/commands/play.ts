import { randomUUIDv7 } from "bun";
import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Bot } from "../core/discord";
import { MessageHelper } from "../utils/message-embed";

@Discord()
class Play {
  @Slash({ description: "play the music", name: "play" })
  async autocomplete(
    @SlashOption({
      description: "What to play?",
      name: "query",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    })
    message: string,
    interaction: CommandInteraction | AutocompleteInteraction
  ): Promise<void> {
    try {
      if (interaction.isAutocomplete()) {
        const focusedValue = interaction.options.getFocused();
        interaction.respond([{ name: "test", value: "test" }]);
      } else {
        await Bot.Manager.connect(interaction);
      }
    } catch (err) {
      await MessageHelper.handleError(
        interaction,
        `query: "${message}"`,
        err,
      );
    }
  }
}
