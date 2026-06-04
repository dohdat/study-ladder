import { describe, expect, it } from "vitest";

import { getDistractingSitesDraftUpdate, normalizeDistractingSites } from "../hooks/useStudyBlocker";

describe("distracting site settings", () => {
  it("normalizes domains and removes duplicates", () => {
    expect(normalizeDistractingSites("https://www.reddit.com/r/all\nreddit.com, YouTube.com/watch")).toEqual(["reddit.com", "youtube.com"]);
  });

  it("preserves existing blocked sites when redirects are active", () => {
    const update = getDistractingSitesDraftUpdate(["reddit.com", "facebook.com"], "reddit.com\nyoutube.com", false);

    expect(update.sites).toEqual(["reddit.com", "facebook.com", "youtube.com"]);
    expect(update.draft).toBe("reddit.com\nfacebook.com\nyoutube.com");
    expect(update.removedExistingSites).toBe(true);
  });

  it("allows removal while redirects are paused", () => {
    const update = getDistractingSitesDraftUpdate(["reddit.com", "facebook.com"], "reddit.com\nyoutube.com", true);

    expect(update.sites).toEqual(["reddit.com", "youtube.com"]);
    expect(update.draft).toBe("reddit.com\nyoutube.com");
    expect(update.removedExistingSites).toBe(true);
  });
});
