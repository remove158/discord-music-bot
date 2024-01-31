import { SlashCommandBuilder, type Interaction, type CacheType, Client } from "discord.js"
import type { Manager } from "erela.js"
import { builder, silentMessage, silentMessageWithThumbnail } from "../utils/message"



const handler = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription('play music')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('song name or url').setRequired(true))
	,
	async execute(interaction: Interaction<CacheType>, client: Client, manager: Manager) {
		if (!interaction.isChatInputCommand()) return
		const query = interaction.options.get('query', true).value as string
		const user = interaction.member?.user
		const voice_channel_id = (interaction as any)?.member?.voice?.channel?.id

		if (!voice_channel_id) return await silentMessage(interaction,'คุณไม่ได้อยู่ใน Voice Channel', 'กรุณาเข้า Voice Channel')

		const guild_id = interaction.guildId
		const text_channel_id = interaction.channelId
		if (!user || !guild_id || !voice_channel_id || !text_channel_id) return await silentMessage(interaction,'ไม่พบเพลง', `ไม่พบผลการค้นหา: ${query}`)
		


		const player = manager.create({
			guild: guild_id,
			voiceChannel: voice_channel_id,
			textChannel: text_channel_id,
			selfDeafen: true,
		});

		if (player.state !== "CONNECTED") {
			console.log('Connect bot to', voice_channel_id)
			await player.connect();
		}

		const result = await player.search(query, interaction.user)
		if (result.tracks.length == 0) {
			await silentMessage(interaction,'ไม่พบเพลง', `ไม่พบเพลง ${query}`)
		}

		player.queue.add(result.tracks[0]); // add track
		if (!player?.queue?.totalSize || (!player.paused && !player.playing)) {
			player.play()
			if (!player.paused && !player.playing) player.pause(false)
		}
		await silentMessageWithThumbnail(interaction, 'เพิ่มเพลง',  `[${result.tracks[0].title}](${result.tracks[0].uri})`, result.tracks[0].thumbnail ?? "")


	}
}
export default handler