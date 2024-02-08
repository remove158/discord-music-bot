import {
	Events, Interaction
} from "discord.js";

import { Event } from "../types/Client";

export default {
	name: Events.InteractionCreate,
	execute: async (client, interaction: Interaction) => {
		if (!interaction.isChatInputCommand()) return
		const command = client.commands.get(interaction.commandName)

		try {
			if (!command) return
			console.log(`${interaction.member?.user.username} > ${interaction.commandName}`)
			await command.execute(client, interaction)

		} catch (err) {
			console.error(err)
			return interaction.reply({ ephemeral: true, content: `Some thing went wrong with '${interaction.commandName}'` });
		}
	}
} as Event