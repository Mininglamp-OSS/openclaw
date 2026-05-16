/**
 * parseTarget routing tests — lock in the correct channel-type resolution
 * for every target format the message tool accepts.
 */
import { describe, it, expect } from "vitest";
import { parseTarget } from "./actions.js";
import { ChannelType } from "./types.js";

const THREAD_SEP = "____";

describe("parseTarget — explicit prefixes", () => {
  it("group: → Group", () => {
    const r = parseTarget("group:abc123");
    expect(r.channelId).toBe("abc123");
    expect(r.channelType).toBe(ChannelType.Group);
  });

  it("group:parentId____threadId → CommunityTopic", () => {
    const r = parseTarget(`group:parent${THREAD_SEP}thread`);
    expect(r.channelId).toBe(`parent${THREAD_SEP}thread`);
    expect(r.channelType).toBe(ChannelType.CommunityTopic);
  });

  it("channel: is an alias for group:", () => {
    const r = parseTarget("channel:abc123");
    expect(r.channelId).toBe("abc123");
    expect(r.channelType).toBe(ChannelType.Group);
  });

  it("channel:parentId____threadId → CommunityTopic", () => {
    const r = parseTarget(`channel:parent${THREAD_SEP}thread`);
    expect(r.channelType).toBe(ChannelType.CommunityTopic);
  });

  it("user: → DM", () => {
    const r = parseTarget("user:uid123");
    expect(r.channelId).toBe("uid123");
    expect(r.channelType).toBe(ChannelType.DM);
  });
});

describe("parseTarget — bare IDs with channel-namespace prefixes", () => {
  it("octo: prefix is stripped", () => {
    const r = parseTarget("octo:abc123", undefined, new Set(["abc123"]));
    expect(r.channelId).toBe("abc123");
    expect(r.channelType).toBe(ChannelType.Group);
  });

  it("dmwork: prefix is stripped (legacy compat)", () => {
    const r = parseTarget("dmwork:abc123", undefined, new Set(["abc123"]));
    expect(r.channelId).toBe("abc123");
    expect(r.channelType).toBe(ChannelType.Group);
  });

  it("bare thread ID (contains ____) → CommunityTopic", () => {
    const r = parseTarget(`parent${THREAD_SEP}thread`);
    expect(r.channelId).toBe(`parent${THREAD_SEP}thread`);
    expect(r.channelType).toBe(ChannelType.CommunityTopic);
  });
});

describe("parseTarget — bare group IDs resolved via knownGroupIds", () => {
  it("bare ID in knownGroupIds → Group", () => {
    const r = parseTarget("abc123", undefined, new Set(["abc123"]));
    expect(r.channelId).toBe("abc123");
    expect(r.channelType).toBe(ChannelType.Group);
  });
});
