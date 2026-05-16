import type { StudyState } from "../types/study";

const DB_NAME = "study-ladder-db";
const DB_VERSION = 1;
const STORE_NAME = "state";
const STATE_KEY = "study-ladder-v1";

const openStudyDb = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const withStore = async <T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await openStudyDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = callback(transaction.objectStore(STORE_NAME));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const loadStudyState = async () => {
  return withStore<StudyState | undefined>("readonly", (store) => store.get(STATE_KEY));
};

export const saveStudyState = async (state: StudyState) => {
  await withStore<IDBValidKey>("readwrite", (store) => store.put(state, STATE_KEY));
};

export const migrateLocalStorageState = async () => {
  const existing = await loadStudyState();
  if (existing) {
    return existing;
  }

  const legacy = localStorage.getItem(STATE_KEY);
  if (!legacy) {
    return null;
  }

  try {
    const parsed = JSON.parse(legacy) as StudyState;
    await saveStudyState(parsed);
    localStorage.setItem(`${STATE_KEY}-migrated-to-indexeddb`, "true");
    return parsed;
  } catch {
    return null;
  }
};
