/**
 * @openclaw/octo - bundled channel plugin entry.
 *
 * Connects OpenClaw to the Octo messaging platform via WebSocket for
 * real-time messaging.
 *
 * Bundled-plugin scope: this entry does NOT ship CLI-only install/update/
 * uninstall commands — those operate on the host via `openclaw plugins ...`
 * and are unnecessary when the plugin is bundled in core.
 */

import { defineBundledChannelEntry } from "openclaw/plugin-sdk/channel-entry-contract";
import { getGroupMdForPrompt } from "./src/group-md.js";
import { pendingInboundContext } from "./src/inbound.js";

const CHANNEL_ID = "octo";

function validateAccountId(value: string): boolean {
  return /^[A-Za-z0-9_]+$/.test(value);
}

function channelConfigPath(...parts: string[]): string {
  return ["channels", CHANNEL_ID, ...parts].join(".");
}

export default defineBundledChannelEntry({
  id: "octo",
  name: "Octo",
  description: "Octo channel plugin",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "octoPlugin",
  },
  runtime: {
    specifier: "./runtime-setter-api.js",
    exportName: "setOctoRuntime",
  },
  registerFull(api) {
    // -----------------------------------------------------------------------
    // Slash command handlers
    // -----------------------------------------------------------------------

    async function handleDoctor(_ctx: unknown) {
      // Bundled-plugin doctor: defer real diagnostics to `openclaw doctor`,
      // which already understands bundled channel state.
      return {
        text:
          "Octo doctor: run `openclaw doctor` for full diagnostics. " +
          "In bundled mode the host doctor reports channel/account health.",
      };
    }

    async function handleInfo() {
      const version = api.version ?? "unknown";
      return {
        text: [
          "octo: bundled",
          `openclaw: ${version}`,
          "plugin package: @openclaw/octo",
        ].join("\n"),
      };
    }

    async function handleAddAccount(ctx: { args?: string }) {
      const parts = ctx.args?.trim().split(/\s+/) ?? [];
      if (parts.length < 3) {
        return {
          text:
            "Usage: /octo_add_account <account_id> <bot_token> <api_url>\n" +
            "Or use the CLI: openclaw config set channels.octo.accounts.<id>.botToken=<token>",
          isError: true,
        };
      }
      const [accountId, botToken, apiUrl] = parts;
      if (!validateAccountId(accountId)) {
        return {
          text: `Invalid account ID "${accountId}". Only letters, digits, and underscores allowed.`,
          isError: true,
        };
      }
      if (!botToken.startsWith("bf_")) {
        return { text: "Bot token must start with 'bf_'.", isError: true };
      }
      // In bundled mode, config writes go through the CLI or gateway RPC.
      // Return the equivalent CLI commands for the user to run.
      const configCmd = `openclaw config set ${channelConfigPath("accounts", accountId, "botToken")}=${botToken}`;
      const apiCmd = `openclaw config set ${channelConfigPath("accounts", accountId, "apiUrl")}=${apiUrl}`;
      return {
        text:
          `To add this account, run:\n\n${configCmd}\n${apiCmd}\n\n` +
          "Then restart the gateway: openclaw restart",
      };
    }

    async function handleRemoveAccount(ctx: { args?: string }) {
      const accountId = ctx.args?.trim();
      if (!accountId) {
        return { text: "Usage: /octo_remove_account <account_id>", isError: true };
      }
      if (!validateAccountId(accountId)) {
        return {
          text: `Invalid account ID "${accountId}". Only letters, digits, and underscores allowed.`,
          isError: true,
        };
      }
      return {
        text:
          `To remove this account, run:\n\n` +
          `openclaw config unset ${channelConfigPath("accounts", accountId)}\n\n` +
          "Then restart the gateway: openclaw restart",
      };
    }

    // -----------------------------------------------------------------------
    // Command registration
    // -----------------------------------------------------------------------

    api.registerCommand({
      name: "octo_doctor",
      description: "Check Octo plugin status and connectivity",
      acceptsArgs: true,
      handler: handleDoctor as any,
    });
    api.registerCommand({
      name: "octo_info",
      description: "Show Octo plugin version info",
      acceptsArgs: false,
      handler: handleInfo,
    });
    api.registerCommand({
      name: "octo_add_account",
      description: "Add or update an Octo bot account. Args: <account_id> <bot_token> <api_url>",
      acceptsArgs: true,
      handler: handleAddAccount as any,
    });
    api.registerCommand({
      name: "octo_remove_account",
      description: "Remove an Octo bot account. Args: <account_id>",
      acceptsArgs: true,
      handler: handleRemoveAccount as any,
    });

    // -----------------------------------------------------------------------
    // Hooks
    // -----------------------------------------------------------------------

    api.on("before_prompt_build", (_event, ctx) => {
      const sections: string[] = [];

      // 1. Group/Thread MD — wrapped in [GROUP CONTEXT] block
      const groupMdContent = getGroupMdForPrompt(ctx);
      if (groupMdContent) {
        sections.push(`[GROUP CONTEXT]\n${groupMdContent}\n[/GROUP CONTEXT]`);
      }

      // 2. Inbound context (member list + history) — outside [GROUP CONTEXT]
      const sessionKey = ctx.sessionKey;
      if (sessionKey) {
        const pending = pendingInboundContext.get(sessionKey);
        if (pending) {
          pendingInboundContext.delete(sessionKey);
          if (pending.memberListPrefix) sections.push(pending.memberListPrefix);
          if (pending.historyPrefix) sections.push(pending.historyPrefix);
        }
      }

      if (sections.length === 0) return;
      return { prependContext: sections.join("\n\n") };
    });
  },
});
