/**
 * Optimized localStorage utility with debouncing, batching, and caching
 * Significantly improves performance for frequent data operations
 */

interface StorageCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  };
}

interface PendingWrite {
  key: string;
  data: any;
  timestamp: number;
}

class OptimizedStorage {
  private cache: StorageCache = {};
  private pendingWrites: Map<string, PendingWrite> = new Map();
  private writeQueue: PendingWrite[] = [];
  private isProcessing = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 100; // 100ms debounce
  private readonly BATCH_SIZE = 10;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data from cache first, then localStorage
   */
  get<T = any>(key: string, defaultValue: T | null = null): T | null {
    // Check cache first
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Cache the result
        this.cache[key] = {
          data,
          timestamp: Date.now(),
          ttl: this.DEFAULT_TTL
        };
        return data;
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
    }

    return defaultValue;
  }

  /**
   * Set data with debouncing and batching
   */
  set<T = any>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Update cache immediately for instant access
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Add to pending writes
    this.pendingWrites.set(key, {
      key,
      data,
      timestamp: Date.now()
    });

    // Debounce the actual localStorage write
    this.debouncedWrite();
  }

  /**
   * Batch multiple sets into a single operation
   */
  setBatch(operations: Array<{ key: string; data: any; ttl?: number }>): void {
    operations.forEach(({ key, data, ttl = this.DEFAULT_TTL }) => {
      this.set(key, data, ttl);
    });
  }

  /**
   * Remove data from both cache and localStorage
   */
  remove(key: string): void {
    delete this.cache[key];
    this.pendingWrites.delete(key);
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.cache = {};
    this.pendingWrites.clear();
    this.writeQueue = [];
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get multiple keys at once
   */
  getMultiple<T = any>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    
    return result;
  }

  /**
   * Check if key exists in cache or localStorage
   */
  has(key: string): boolean {
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return true;
    }
    
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: Object.keys(this.cache).length,
      pendingWrites: this.pendingWrites.size,
      writeQueueSize: this.writeQueue.length,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      const cached = this.cache[key];
      if (now - cached.timestamp >= cached.ttl) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Debounced write to localStorage
   */
  private debouncedWrite(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processWriteQueue();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Process the write queue in batches
   */
  private async processWriteQueue(): Promise<void> {
    if (this.isProcessing || this.pendingWrites.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Move pending writes to queue
      this.writeQueue = Array.from(this.pendingWrites.values());
      this.pendingWrites.clear();

      // Process in batches
      while (this.writeQueue.length > 0) {
        const batch = this.writeQueue.splice(0, this.BATCH_SIZE);
        await this.writeBatch(batch);
      }
    } catch (error) {
      console.error('Error processing write queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Write a batch of data to localStorage
   */
  private async writeBatch(batch: PendingWrite[]): Promise<void> {
    try {
      // Use requestIdleCallback for non-blocking writes
      if (typeof requestIdleCallback !== 'undefined') {
        await new Promise<void>((resolve) => {
          requestIdleCallback(() => {
            batch.forEach(({ key, data }) => {
              try {
                localStorage.setItem(key, JSON.stringify(data));
              } catch (error) {
                console.error(`Error writing to localStorage for key "${key}":`, error);
              }
            });
            resolve();
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        batch.forEach(({ key, data }) => {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (error) {
            console.error(`Error writing to localStorage for key "${key}":`, error);
          }
        });
      }
    } catch (error) {
      console.error('Error in writeBatch:', error);
    }
  }

  /**
   * Force flush all pending writes
   */
  flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    return this.processWriteQueue();
  }
}

// Create singleton instance
export const optimizedStorage = new OptimizedStorage();

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  optimizedStorage['clearExpiredCache']();
}, 5 * 60 * 1000);

// Flush pending writes before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    optimizedStorage.flush();
  });
}

export default optimizedStorage;
