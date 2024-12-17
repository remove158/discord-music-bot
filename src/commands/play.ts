import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import type { Track, UnresolvedTrack } from "lavalink-client";
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
      const player = await Bot.Manager.connectPlayer(interaction);
      if (interaction.isAutocomplete()) {
        const searchResult = await player.search(
          {
            query: message,
          },
          interaction.user
        );
        if (!searchResult.tracks.length)
          return await interaction.respond([
            { name: `No Tracks found`, value: "nothing_found" },
          ]);

        await interaction.respond(
          searchResult.loadType === "playlist"
            ? [
                {
                  name: `Playlist [${searchResult.tracks.length} Tracks] - ${searchResult.playlist?.title}`,
                  value: `autocomplete_0`,
                },
              ]
            : searchResult.tracks
                .map((t: Track | UnresolvedTrack, i) => ({
                  name: `[${t.info.title} (by ${
                    t.info.author || "Unknown-Author"
                  })`.substring(0, 100),
                  value: `autocomplete_${i}`,
                }))
                .slice(0, 25)
        );
      } else {
        interaction.reply(String(message));
      }
    } catch (err) {
        await MessageHelper.handleError(
          interaction,
          `query: "${message}"`,
          err
        );
    }
  }
}
