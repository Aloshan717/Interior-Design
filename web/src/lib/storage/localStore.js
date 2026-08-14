/**
 * التخزين المحلي — IndexedDB.
 * مخزنان: `projects` للبيانات (JSON خفيف) و`blobs` للصور.
 * فصلهما مقصود: نستطيع مزامنة المشاريع للسحابة لاحقاً دون رفع الصور الثقيلة.
 */

const DB_NAME = 'interior-designer';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_BLOBS = 'blobs';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'projectId' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(store, mode, run) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const req = run(transaction.objectStore(store));
    transaction.onerror = () => reject(transaction.error);
    if (req) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      transaction.oncomplete = () => resolve();
    }
  });
}

export const localStore = {
  async listProjects() {
    const all = await tx(STORE_PROJECTS, 'readonly', (s) => s.getAll());
    return (all ?? []).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },

  getProject(projectId) {
    return tx(STORE_PROJECTS, 'readonly', (s) => s.get(projectId));
  },

  saveProject(project) {
    return tx(STORE_PROJECTS, 'readwrite', (s) => s.put(project));
  },

  async deleteProject(projectId) {
    const project = await this.getProject(projectId);
    if (project) {
      const keys = collectBlobKeys(project);
      await Promise.all(keys.map((k) => this.deleteBlob(k)));
    }
    return tx(STORE_PROJECTS, 'readwrite', (s) => s.delete(projectId));
  },

  /** الصور تُخزّن كـBlob لا كـbase64: أخف بـ٣٣٪ وأسرع في العرض */
  putBlob(key, blob) {
    return tx(STORE_BLOBS, 'readwrite', (s) => s.put(blob, key));
  },

  getBlob(key) {
    return tx(STORE_BLOBS, 'readonly', (s) => s.get(key));
  },

  deleteBlob(key) {
    return tx(STORE_BLOBS, 'readwrite', (s) => s.delete(key));
  },

  async clearAll() {
    await tx(STORE_PROJECTS, 'readwrite', (s) => s.clear());
    await tx(STORE_BLOBS, 'readwrite', (s) => s.clear());
  },

  async usage() {
    if (!navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  },
};

function collectBlobKeys(project) {
  const keys = [];
  project.uploadedImages?.forEach((img) => {
    if (img.blobKey) keys.push(img.blobKey);
    if (img.thumbnailKey) keys.push(img.thumbnailKey);
  });
  if (project.floorPlan?.blobKey) keys.push(project.floorPlan.blobKey);
  project.generatedConcepts?.forEach((c) => c.imageKey && keys.push(c.imageKey));
  project.finalDesigns?.forEach((d) => d.imageKey && keys.push(d.imageKey));
  return keys;
}

/**
 * ذاكرة عناوين مؤقتة للصور — تمنع تسريب الذاكرة من إنشاء
 * objectURL جديد في كل إعادة رسم.
 */
const urlCache = new Map();

export async function blobURL(key) {
  if (!key) return null;
  if (key.startsWith('data:') || key.startsWith('http')) return key;
  if (urlCache.has(key)) return urlCache.get(key);

  const blob = await localStore.getBlob(key);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

export function releaseURL(key) {
  const url = urlCache.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(key);
  }
}
