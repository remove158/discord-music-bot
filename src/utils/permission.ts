import type { Interaction } from "discord.js";
import { envConfig } from "../env";

export const isOwner = (interaction: Interaction) => envConfig.OWNER_USERNAME === interaction.user.username