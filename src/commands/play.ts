import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
  type CacheType,
  type Interaction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { LavalinkManager, type SearchResult, type Track, type UnresolvedTrack } from "lavalink-client";
import { Bot } from "../core/discord";
import { MessageHelper } from "../utils/message-embed";
import { LavaPlayerManager } from "../core/manager";
import { formatMS_HHMMSS } from "../utils/format";

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
    interaction: Interaction<CacheType>
  ): Promise<any> {
    try {
      const player = await LavaPlayerManager.getConnectedPlayer(interaction);
      if (interaction.isAutocomplete()) {
        const searchResult = await player.search(
          {
            query: message,
          },
          interaction.user
        ) as SearchResult
        if (!searchResult.tracks.length)
          return await interaction.respond([
            { name: `No Tracks found`, value: "nothing_found" },
          ]);

        LavaPlayerManager.setAutocompleteCache(interaction, searchResult);
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
                name: `[${t.info.title} (by ${t.info.author || "Unknown-Author"
                  })`.substring(0, 100),
                value: `autocomplete_${i}`,
              }))
              .slice(0, 25)
        );

      } else {
        const autoCompleteSearchResult = LavaPlayerManager.getAutoCompleteSearchResult(interaction, message)
        if (!player.connected) await player.connect()
        const searchResult = autoCompleteSearchResult ?? await player.search(
          {
            query: message,
          },
          interaction.user
        ) as SearchResult

        if (!searchResult || !searchResult.tracks?.length) {
          return interaction.reply({
            content: `No Tracks found`,
            ephemeral: true
          })
        }

        const track = searchResult.tracks[autoCompleteSearchResult ? Number(message.replace("autocomplete_", "")) : 0]
        await player.queue.add(searchResult.loadType === "playlist" ? searchResult.tracks : track)

        if (!player.playing)
          await player.play(
            { volume: 100, paused: false }
          )

        const TITLE =
          searchResult.loadType === 'playlist' ? 'ADDED TRACKS' : 'ADDED TRACK'

        const BODY =
          searchResult.loadType === 'playlist'
            ? `✅ Added [${searchResult.tracks.length}] Tracks${searchResult.playlist?.title ? ` - from the ${searchResult.pluginInfo.type || 'Playlist'} ${searchResult.playlist.uri ? `[\`${searchResult.playlist.title}\`](<${searchResult.playlist.uri}>)` : `\`${searchResult.playlist.title}\``}` : ''} at \`#${player.queue.tracks.length - searchResult.tracks.length}\``
            : `[${formatMS_HHMMSS(track.info.duration)}] [${track.info.title}](${track.info.uri}) (by ${track.info.author || 'Unknown-Author'})`

        await MessageHelper.replySilent(interaction, MessageHelper.createEmbed(
          TITLE, BODY
        ))

      }
    } catch (err) {
      await MessageHelper.handleError(interaction, `query: "${message}"`, err);
    }
  }
}
