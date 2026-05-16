import type { ChannelPlugin } from "openclaw/plugin-sdk";
import type { ResolvedOctoAccount } from "./accounts.js";
import { OctoConfigJsonSchema } from "./config-schema.js";
import { CHANNEL_ID } from "./constants.js";

export const octoSetupPlugin: ChannelPlugin<ResolvedOctoAccount> = {
  id: CHANNEL_ID,
  configSchema: OctoConfigJsonSchema,
};
