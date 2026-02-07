import { useState, useEffect, useCallback } from 'react';

// IndexedDB configuration
const DB_NAME = 'rafiq-nihon-audio';
const DB_VERSION = 1;
const STORE_NAME = 'audio-cache';

interface CachedAudio {
  id: string;
  url: string;
  blob: Blob;
  text: string;
  type: 'vocabulary' | 'speaking' | 'kana' | 'kanji';
  downloadedAt: number;
  size: number;
}

interface DownloadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface OfflineAudioState {
  isReady: boolean;
  cachedCount: number;
  totalSize: number;
  downloads: Map<string, DownloadProgress>;
}

/**
 * Hook for managing offline audio downloads using IndexedDB
 */
export function useOfflineAudio() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [state, setState] = useState<OfflineAudioState>({
    isReady: false,
    cachedCount: 0,
    totalSize: 0,
    downloads: new Map(),
  });

  // Initialize IndexedDB
  useEffect(() => {
    const openDB = () => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
      };

      request.onsuccess = () => {
        const database = request.result;
        setDb(database);
        refreshStats(database);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('url', 'url', { unique: true });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }
      };
    };

    openDB();

    return () => {
      db?.close();
    };
  }, []);

  // Refresh cache statistics
  const refreshStats = useCallback((database: IDBDatabase) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result as CachedAudio[];
      const totalSize = items.reduce((acc, item) => acc + item.size, 0);
      
      setState(prev => ({
        ...prev,
        isReady: true,
        cachedCount: items.length,
        totalSize,
      }));
    };
  }, []);

  // Check if audio is cached
  const isCached = useCallback(async (id: string): Promise<boolean> => {
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
  }, [db]);

  // Get cached audio blob
  const getCachedAudio = useCallback(async (id: string): Promise<Blob | null> => {
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as CachedAudio | undefined;
        resolve(result?.blob || null);
      };
      request.onerror = () => resolve(null);
    });
  }, [db]);

  // Download and cache audio
  const downloadAudio = useCallback(async (
    id: string,
    url: string,
    text: string,
    type: CachedAudio['type'] = 'vocabulary'
  ): Promise<boolean> => {
    if (!db) return false;

    // Check if already cached
    const cached = await isCached(id);
    if (cached) return true;

    // Update download status
    setState(prev => {
      const downloads = new Map(prev.downloads);
      downloads.set(id, { id, progress: 0, status: 'downloading' });
      return { ...prev, downloads };
    });

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      const cachedAudio: CachedAudio = {
        id,
        url,
        blob,
        text,
        type,
        downloadedAt: Date.now(),
        size: blob.size,
      };

      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(cachedAudio);

        request.onsuccess = () => {
          setState(prev => {
            const downloads = new Map(prev.downloads);
            downloads.set(id, { id, progress: 100, status: 'completed' });
            return {
              ...prev,
              downloads,
              cachedCount: prev.cachedCount + 1,
              totalSize: prev.totalSize + blob.size,
            };
          });
          resolve(true);
        };

        request.onerror = () => {
          setState(prev => {
            const downloads = new Map(prev.downloads);
            downloads.set(id, { id, progress: 0, status: 'error', error: 'Storage failed' });
            return { ...prev, downloads };
          });
          resolve(false);
        };
      });
    } catch (error) {
      setState(prev => {
        const downloads = new Map(prev.downloads);
        downloads.set(id, { 
          id, 
          progress: 0, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Download failed' 
        });
        return { ...prev, downloads };
      });
      return false;
    }
  }, [db, isCached]);

  // Download multiple audio files
  const downloadBatch = useCallback(async (
    items: Array<{ id: string; url: string; text: string; type: CachedAudio['type'] }>
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const item of items) {
      const result = await downloadAudio(item.id, item.url, item.text, item.type);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }, [downloadAudio]);

  // Remove cached audio
  const removeAudio = useCallback(async (id: string): Promise<boolean> => {
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Get the item first to update size
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result as CachedAudio | undefined;
        
        if (!item) {
          resolve(false);
          return;
        }

        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
          setState(prev => ({
            ...prev,
            cachedCount: prev.cachedCount - 1,
            totalSize: prev.totalSize - item.size,
          }));
          resolve(true);
        };
        
        deleteRequest.onerror = () => resolve(false);
      };
    });
  }, [db]);

  // Clear all cached audio
  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        setState(prev => ({
          ...prev,
          cachedCount: 0,
          totalSize: 0,
          downloads: new Map(),
        }));
        resolve(true);
      };

      request.onerror = () => resolve(false);
    });
  }, [db]);

  // Get all cached items by type
  const getCachedByType = useCallback(async (
    type: CachedAudio['type']
  ): Promise<Array<Omit<CachedAudio, 'blob'>>> => {
    if (!db) return [];

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const items = request.result.map(({ blob, ...rest }) => rest);
        resolve(items);
      };
      
      request.onerror = () => resolve([]);
    });
  }, [db]);

  // Get playable URL from cache (creates object URL)
  const getPlayableUrl = useCallback(async (id: string): Promise<string | null> => {
    const blob = await getCachedAudio(id);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [getCachedAudio]);

  // Format size for display
  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return {
    ...state,
    isCached,
    getCachedAudio,
    getPlayableUrl,
    downloadAudio,
    downloadBatch,
    removeAudio,
    clearCache,
    getCachedByType,
    formatSize,
  };
}
