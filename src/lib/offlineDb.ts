export interface OfflineRegion {
  id: string;
  name: string;
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  minZoom: number;
  maxZoom: number;
  totalTiles: number;
  downloadedTiles: number;
  sizeBytes: number;
  status: 'completed' | 'downloading' | 'paused' | 'failed';
  timestamp: number;
  tileUrls?: string[]; // track exact URLs downloaded for easy purging
}

const DB_NAME = "ANISTacticalOfflineDB";
const DB_VERSION = 1;

export const initOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("tiles")) {
        db.createObjectStore("tiles", { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains("regions")) {
        db.createObjectStore("regions", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCachedTile = async (url: string): Promise<Blob | null> => {
  const db = await initOfflineDB();
  return new Promise((resolve) => {
    const transaction = db.transaction("tiles", "readonly");
    const store = transaction.objectStore("tiles");
    const request = store.get(url);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.blob);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
};

export const saveTile = async (url: string, blob: Blob): Promise<void> => {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("tiles", "readwrite");
    const store = transaction.objectStore("tiles");
    const data = {
      url,
      blob,
      timestamp: Date.now()
    };
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getRegions = async (): Promise<OfflineRegion[]> => {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("regions", "readonly");
    const store = transaction.objectStore("regions");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const saveRegion = async (region: OfflineRegion): Promise<void> => {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("regions", "readwrite");
    const store = transaction.objectStore("regions");
    const request = store.put(region);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteRegion = async (id: string): Promise<void> => {
  const db = await initOfflineDB();
  
  // First get the region to find the tile URLs to purge
  const region: OfflineRegion | null = await new Promise((resolve) => {
    const transaction = db.transaction("regions", "readonly");
    const store = transaction.objectStore("regions");
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });

  if (region && region.tileUrls && region.tileUrls.length > 0) {
    // Delete associated tiles in batches or transaction
    const tilesTx = db.transaction("tiles", "readwrite");
    const tilesStore = tilesTx.objectStore("tiles");
    region.tileUrls.forEach(url => {
      tilesStore.delete(url);
    });
  }

  // Delete the region record
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("regions", "readwrite");
    const store = transaction.objectStore("regions");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getOfflineCacheStats = async (): Promise<{ tileCount: number; cacheSizeMB: number }> => {
  const db = await initOfflineDB();
  return new Promise((resolve) => {
    const transaction = db.transaction("tiles", "readonly");
    const store = transaction.objectStore("tiles");
    const request = store.openCursor();
    
    let tileCount = 0;
    let totalSizeBytes = 0;

    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        tileCount++;
        const blob = cursor.value.blob as Blob;
        totalSizeBytes += blob.size;
        cursor.continue();
      } else {
        resolve({
          tileCount,
          cacheSizeMB: parseFloat((totalSizeBytes / (1024 * 1024)).toFixed(2))
        });
      }
    };
    request.onerror = () => resolve({ tileCount: 0, cacheSizeMB: 0 });
  });
};

export const clearAllOfflineCache = async (): Promise<void> => {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["tiles", "regions"], "readwrite");
    tx.objectStore("tiles").clear();
    tx.objectStore("regions").clear();
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
