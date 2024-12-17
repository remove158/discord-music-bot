import * as v from "valibot"

const envSchema = v.object({
    DISCORD_TOKEN: v.string("Discord token is required"),
    LAVALINK_NODES: v.string("Lavalink nodes are required"),
    CLIENT_ID: v.string("Client id is required"),
})

function createEnvConfig(data: unknown) {
  return v.parse(envSchema, data);
}

export const envConfig = createEnvConfig(process.env);