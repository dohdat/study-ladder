import { describe, expect, it } from "vitest";

import { getDistractingSitesDraftUpdate, normalizeDistractingSites } from "../hooks/useStudyBlocker";

describe("distracting site settings", () => {
  it("normalizes domains and removes duplicates", () => {
    expect(normalizeDistractingSites("https://www.reddit.com/r/all\nreddit.com, YouTube.com/watch")).toEqual(["reddit.com", "youtube.com"]);
  });

  it("allows existing blocked sites to be removed from the draft", () => {
    const update = getDistractingSitesDraftUpdate(["reddit.com", "facebook.com"], "reddit.com\nyoutube.com");

    expect(update.sites).toEqual(["reddit.com", "youtube.com"]);
    expect(update.draft).toBe("reddit.com\nyoutube.com");
    expect(update.removedExistingSites).toBe(true);
  });

  it("keeps the raw textarea draft while normalizing saved sites", () => {
    const update = getDistractingSitesDraftUpdate(["reddit.com"], "  https://www.reddit.com/r/all\nYouTube.com/watch\n");

    expect(update.sites).toEqual(["reddit.com", "youtube.com"]);
    expect(update.draft).toBe("  https://www.reddit.com/r/all\nYouTube.com/watch\n");
    expect(update.removedExistingSites).toBe(false);
  });
});
