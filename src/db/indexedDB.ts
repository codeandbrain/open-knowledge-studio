/**
 * IndexedDB Service — Zero-dependency persistent storage layer.
 * Replaces localStorage (5-10MB limit) with browser-native IndexedDB (GB-scale).
 * Supports structured data, large files, and version history.
 * @license SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'open-knowledge-studio';
const DB_VERSION = 1;

export interface DBSchema {
  files: { id: string; name: string; type: string; content: string; size: string; url?: string; parentFolderId?: string | null; isActive: boolean; createdAt: string; metadata?: Record<string, any> };
  folders: { id: string; name: string; parentFolderId?: string | null };
  providers: { id: string; config: string };
  urlGroups: { id: string; name: string; urls: string[] };
  prompts: { id: string; title: string; description: string; content: string; category: string; createdAt: string };
  a2aAgents: { id: string; name: string; role: string; avatar: string; systemPrompt: string; color: string; isActive: boolean };
  metrics: { id: string; timestamp: string; topic: string; agentId: string; agentName: string; latencyMs: number; thinkingSeconds?: number; tokensEstimated: number; status: string };
  sandbox: { id: string; settings: string };
  sessions: { id: string; title: string; messages: string; provider: string; modelName: string; createdAt: string };
  versions: { id: string; documentId: string; content: string; createdAt: string; size: string; label?: string };
  kanban: { id: string; boards: string };
  templates: { id: string; name: string; description: string; category: string; content: string; icon?: string };
  tags: { id: string; name: string; color: string };
  appState: { id: string; key: string; value: string };
}

type StoreName = keyof DBSchema;

let dbInstance: IDBDatabase | null = null;
let dbOpenPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbOpenPromise) return dbOpenPromise;

  dbOpenPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const stores: StoreName[] = ['files', 'folders', 'providers', 'urlGroups', 'prompts', 'a2aAgents', 'metrics', 'sandbox', 'sessions', 'versions', 'kanban', 'templates', 'tags', 'appState'];
      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          if (storeName === 'metrics') {
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('agentId', 'agentId', { unique: false });
          }
          if (storeName === 'files') {
            store.createIndex('name', 'name', { unique: false });
            store.createIndex('parentFolderId', 'parentFolderId', { unique: false });
            store.createIndex('type', 'type', { unique: false });
          }
          if (storeName === 'versions') {
            store.createIndex('documentId', 'documentId', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
        }
      });
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(new Error(`IndexedDB open error: ${request.error}`));
    };
  });

  return dbOpenPromise;
}

/* ─── Generic CRUD ─── */
async function getStore(storeName: StoreName, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

export async function dbGet<T extends { id: string }>(storeName: StoreName, id: string): Promise<T | undefined> {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut<T>(storeName: StoreName, data: T): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.put(data);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(storeName: StoreName, id: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClear(storeName: StoreName): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ─── Key-Value Helper (for appState) ─── */
export async function dbGetKey(key: string): Promise<string | null> {
  const result = await dbGet<{ id: string; key: string; value: string }>('appState', key);
  return result?.value ?? null;
}

export async function dbSetKey(key: string, value: string): Promise<void> {
  await dbPut<DBSchema['appState']>('appState', { id: key, key, value });
}

/* ─── Migration from localStorage ─── */
export async function migrateLocalStorage(): Promise<void> {
  const keys: { lsKey: string; store: StoreName; transform?: (val: string) => any }[] = [
    { lsKey: 'kb_files', store: 'files' },
    { lsKey: 'kb_folders', store: 'folders' },
    { lsKey: 'kb_url_groups', store: 'urlGroups' },
    { lsKey: 'kb_provider_config', store: 'providers' },
    { lsKey: 'kb_saved_prompts', store: 'prompts' },
    { lsKey: 'kb_a2a_agents', store: 'a2aAgents' },
    { lsKey: 'kb_a2a_metrics', store: 'metrics' },
    { lsKey: 'kb_sandbox_settings', store: 'sandbox' },
  ];

  for (const { lsKey, store, transform } of keys) {
    const raw = localStorage.getItem(lsKey);
    if (!raw) continue;
    const count = await countStore(store);
    if (count > 0) continue; // Already migrated

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const data = transform ? transform(JSON.stringify(item)) : item;
          await dbPut(store, data);
        }
      } else {
        const data = transform ? transform(raw) : { id: lsKey, config: raw };
        await dbPut(store, data);
      }
      console.log(`[OKS] Migrated ${lsKey} → IndexedDB:${store}`);
    } catch (e) {
      console.warn(`[OKS] Migration skipped for ${lsKey}:`, e);
    }
  }
}

async function countStore(storeName: StoreName): Promise<number> {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* ─── Full Export / Import ─── */
export async function exportAllData(): Promise<string> {
  const stores: StoreName[] = ['files', 'folders', 'providers', 'urlGroups', 'prompts', 'a2aAgents', 'metrics', 'sandbox', 'sessions', 'versions', 'kanban', 'templates', 'tags', 'appState'];
  const exportData: Record<string, any> = {};
  for (const store of stores) {
    exportData[store] = await dbGetAll(store);
  }
  return JSON.stringify(exportData, null, 2);
}

export async function importAllData(jsonStr: string): Promise<void> {
  const data = JSON.parse(jsonStr);
  const stores = Object.keys(data) as StoreName[];
  for (const store of stores) {
    if (Array.isArray(data[store])) {
      for (const item of data[store]) {
        await dbPut(store, item);
      }
    }
  }
}
