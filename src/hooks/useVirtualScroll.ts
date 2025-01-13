import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useCallback } from 'react';

const LINE_HEIGHT = 24;
const OVERSCAN_COUNT = 5;
const CHUNK_SIZE = 50;

interface VirtualLine {
  index: number;
  text: string;
  height: number;
}

export function useVirtualScroll(content: string) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize line splitting to prevent unnecessary recalculations
  const lines = useMemo(() => {
    return content.split('\n').map((text, index) => ({
      index,
      text,
      height: LINE_HEIGHT * Math.ceil(text.length / 80), // Estimate height based on text length
    }));
  }, [content]);

  // Create chunks of lines for better performance
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
      result.push(lines.slice(i, i + CHUNK_SIZE));
    }
    return result;
  }, [lines]);

  // Estimate size callback for variable height lines
  const estimateSize = useCallback(
    (index: number) => {
      const line = lines[index];
      return line ? line.height : LINE_HEIGHT;
    },
    [lines]
  );

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: OVERSCAN_COUNT,
  });

  // Calculate the range of visible lines
  const visibleRange = useMemo(() => {
    const items = virtualizer.getVirtualItems();
    if (items.length === 0) return { start: 0, end: 0 };
    return {
      start: items[0].index,
      end: items[items.length - 1].index,
    };
  }, [virtualizer]);

  // Get the chunk indices that contain visible lines
  const visibleChunks = useMemo(() => {
    const startChunk = Math.floor(visibleRange.start / CHUNK_SIZE);
    const endChunk = Math.floor(visibleRange.end / CHUNK_SIZE);
    return { startChunk, endChunk };
  }, [visibleRange]);

  // Memoize visible content to prevent unnecessary re-renders
  const visibleContent = useMemo(() => {
    const result: VirtualLine[] = [];
    for (let i = visibleChunks.startChunk; i <= visibleChunks.endChunk; i++) {
      if (chunks[i]) {
        result.push(...chunks[i]);
      }
    }
    return result;
  }, [chunks, visibleChunks]);

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    visibleContent,
    scrollToIndex: virtualizer.scrollToIndex,
    getVirtualItemForOffset: (offset: number) => {
      const index = Math.floor(offset / LINE_HEIGHT);
      return lines[index];
    },
  };
}
