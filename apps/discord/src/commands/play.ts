import {
  ApplicationCommandOptionType,
  type CacheType,
  type Interaction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import {
  type SearchResult,
  type Track,
  type UnresolvedTrack,
} from "lavalink-client";
import { LavaPlayerManager } from "../core/manager";
import { MessageHelper } from "../utils/message-embed";

@Discord()
class Play {
  @Slash({ description: "play the music", name: "play" })
  async handler(
    @SlashOption({
      description: "What to play?",
      name: "query",
      required: true,
      minLength: 1,
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    })
    message: string,
    interaction: Interaction<CacheType>,
  ): Promise<any> {
    try {
      const player = await LavaPlayerManager.getConnectedPlayer(interaction);
      if (interaction.isAutocomplete()) {
        if (!message) {
          return await interaction.respond([
            { name: `No Tracks found`, value: "nothing_found" },
          ]);
        }
        const searchResult = (await player.search(
          {
            query: message,
          },
          interaction.user,
        )) as SearchResult;
        if (!searchResult.tracks.length)
          return await interaction.respond([
            { name: `No Tracks found`, value: "nothing_found" },
          ]);

        LavaPlayerManager.setAutocompleteCache(interaction, searchResult);
        await interaction.respond(this.createOptions(searchResult));
      } else {
        const autoCompleteSearchResult =
          LavaPlayerManager.getAutoCompleteSearchResult(interaction, message);
        if (!player.connected) await player.connect();
        const searchResult =
          autoCompleteSearchResult ??
          ((await player.search(
            {
              query: message,
            },
            interaction.user,
          )) as SearchResult);

        if (!searchResult || !searchResult.tracks?.length) {
          return interaction.followUp({
            content: `No Tracks found`,
            ephemeral: true,
          });
        }

        const track =
          searchResult.tracks[
            autoCompleteSearchResult
              ? Number(message.replace("autocomplete_", ""))
              : 0
          ];
        await player.queue.add(
          searchResult.loadType === "playlist" ? searchResult.tracks : track,
        );

        if (!player.playing) await player.play({ volume: 100, paused: false });

        await MessageHelper.replySilent(
          interaction,
          MessageHelper.createEmbed({
            description: MessageHelper.createAddedResult(
              searchResult,
              player,
              track,
            ),
          }),
        );
      }
    } catch (err) {
      await MessageHelper.handleError(interaction, `query: "${message}"`, err);
    }
  }

  createOptions(searchResult: SearchResult) {
    return searchResult.loadType === "playlist"
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
          .slice(0, 25);
  }
}
