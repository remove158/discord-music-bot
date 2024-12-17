import { ApplicationCommandOptionType, CommandInteraction, AutocompleteInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Bot } from "../core/discord";

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
    interaction: CommandInteraction | AutocompleteInteraction,
  ): Promise<void> {
    Bot.Manager.connect(interaction)
    if (interaction.isAutocomplete()) {
      const focusedValue = interaction.options.getFocused();
      interaction.respond([{name: "test", value: "test"}])
    }
  }
}