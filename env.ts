import * as v from "valibot"

const envSchema = v.object({
    DISCORD_TOKEN: v.string("Discord token is required"),
})

function createEnvConfig(data: unknown) {
  return v.parse(envSchema, data);
}

export const envConfig = createEnvConfig(process.env);