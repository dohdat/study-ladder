import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultState } from "../lib/studyCore";
import { loadStudyState, migrateLocalStorageState, saveStudyState } from "../lib/studyDb";

const deleteDb = () => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase("study-ladder-db");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Database delete blocked"));
  });
};

const installLocalStorageMock = () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value)
    }
  });
};

describe("studyDb", () => {
  beforeEach(async () => {
    installLocalStorageMock();
    localStorage.clear();
    await deleteDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves and loads study state from IndexedDB", async () => {
    const state = defaultState();
    state.streak = 4;

    await saveStudyState(state);

    await expect(loadStudyState()).resolves.toMatchObject({ streak: 4 });
  });

  it("returns null when there is no IndexedDB or localStorage state", async () => {
    await expect(migrateLocalStorageState()).resolves.toBeNull();
  });

  it("keeps existing IndexedDB state before considering localStorage", async () => {
    const dbState = defaultState();
    dbState.streak = 8;
    await saveStudyState(dbState);
    localStorage.setItem("study-ladder-v1", JSON.stringify({ ...defaultState(), streak: 1 }));

    await expect(migrateLocalStorageState()).resolves.toMatchObject({ streak: 8 });
  });

  it("migrates valid localStorage state into IndexedDB", async () => {
    const legacy = defaultState();
    legacy.streak = 5;
    localStorage.setItem("study-ladder-v1", JSON.stringify(legacy));

    await expect(migrateLocalStorageState()).resolves.toMatchObject({ streak: 5 });
    await expect(loadStudyState()).resolves.toMatchObject({ streak: 5 });
    expect(localStorage.getItem("study-ladder-v1-migrated-to-indexeddb")).toBe("true");
  });

  it("ignores corrupt localStorage state", async () => {
    localStorage.setItem("study-ladder-v1", "{bad json");

    await expect(migrateLocalStorageState()).resolves.toBeNull();
  });
});
