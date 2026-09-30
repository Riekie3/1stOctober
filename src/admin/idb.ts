/**
 * Minimal IndexedDB key/value store for files waiting to be published,
 * so a closed tab doesn't lose uploaded photos and videos.
 */

const DB = "adm-media";
const STORE = "pending";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    t.oncomplete = () => resolve(req ? (req.result as T) : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const idb = {
  put: (key: string, blob: Blob) => tx("readwrite", (s) => s.put(blob, key)).catch(() => undefined),
  del: (key: string) => tx("readwrite", (s) => s.delete(key)).catch(() => undefined),
  clear: () => tx("readwrite", (s) => s.clear()).catch(() => undefined),
  async all(): Promise<Record<string, Blob>> {
    try {
      const db = await open();
      return await new Promise((resolve, reject) => {
        const out: Record<string, Blob> = {};
        const t = db.transaction(STORE, "readonly");
        const cur = t.objectStore(STORE).openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (c) {
            out[String(c.key)] = c.value as Blob;
            c.continue();
          }
        };
        t.oncomplete = () => resolve(out);
        t.onerror = () => reject(t.error);
      });
    } catch {
      return {};
    }
  },
};
