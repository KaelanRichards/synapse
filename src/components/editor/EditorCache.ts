import { EditorState, Selection } from './types';
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  maxSize?: number;
  ttl?: number;
}

interface CacheEntry {
  content: string;
  selection: Selection | null;
  timestamp: number;
  version: number;
}

interface UndoEntry {
  state: Partial<EditorState>;
  timestamp: number;
}

export class EditorCache {
  private contentCache: LRUCache<string, CacheEntry>;
  private undoCache: LRUCache<string, UndoEntry[]>;
  private versionCounter: number = 0;

  constructor(options: CacheOptions = {}) {
    const {
      maxSize = 100,
      ttl = 1000 * 60 * 60, // 1 hour
    } = options;

    this.contentCache = new LRUCache<string, CacheEntry>({
      max: maxSize,
      ttl,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    this.undoCache = new LRUCache<string, UndoEntry[]>({
      max: maxSize,
      ttl,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
  }

  public setContent(
    noteId: string,
    content: string,
    selection: Selection | null = null
  ): void {
    this.versionCounter++;
    this.contentCache.set(noteId, {
      content,
      selection,
      timestamp: Date.now(),
      version: this.versionCounter,
    });
  }

  public getContent(noteId: string): CacheEntry | undefined {
    return this.contentCache.get(noteId);
  }

  public hasContent(noteId: string): boolean {
    return this.contentCache.has(noteId);
  }

  public addUndoState(noteId: string, state: Partial<EditorState>): void {
    const undoStates = this.undoCache.get(noteId) || [];
    undoStates.push({
      state,
      timestamp: Date.now(),
    });

    // Keep only the last 100 undo states
    if (undoStates.length > 100) {
      undoStates.shift();
    }

    this.undoCache.set(noteId, undoStates);
  }

  public getUndoStates(noteId: string): UndoEntry[] {
    return this.undoCache.get(noteId) || [];
  }

  public clearUndoStates(noteId: string): void {
    this.undoCache.delete(noteId);
  }

  public invalidate(noteId: string): void {
    this.contentCache.delete(noteId);
    this.undoCache.delete(noteId);
  }

  public clear(): void {
    this.contentCache.clear();
    this.undoCache.clear();
    this.versionCounter = 0;
  }

  public prune(): void {
    this.contentCache.purgeStale();
    this.undoCache.purgeStale();
  }

  public getStats() {
    return {
      contentSize: this.contentCache.size,
      undoSize: this.undoCache.size,
      version: this.versionCounter,
    };
  }

  public async persist(storage: Storage = localStorage): Promise<void> {
    const cacheData = {
      content: Array.from(this.contentCache.entries()),
      undo: Array.from(this.undoCache.entries()),
      version: this.versionCounter,
    };

    try {
      await storage.setItem('editor-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to persist editor cache:', error);
    }
  }

  public async restore(storage: Storage = localStorage): Promise<void> {
    try {
      const cacheData = await storage.getItem('editor-cache');
      if (!cacheData) return;

      const { content, undo, version } = JSON.parse(cacheData);

      content.forEach(([key, value]: [string, CacheEntry]) => {
        this.contentCache.set(key, value);
      });

      undo.forEach(([key, value]: [string, UndoEntry[]]) => {
        this.undoCache.set(key, value);
      });

      this.versionCounter = version;
    } catch (error) {
      console.error('Failed to restore editor cache:', error);
    }
  }
}
