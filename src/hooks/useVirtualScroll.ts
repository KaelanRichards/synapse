import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

const LINE_HEIGHT = 24;

export function useVirtualScroll(content: string) {
  const parentRef = useRef<HTMLDivElement>(null);
  const lines = content.split('\n');

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LINE_HEIGHT,
    overscan: 5,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}
