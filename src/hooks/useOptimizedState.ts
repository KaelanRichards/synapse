import { useCallback, useRef, useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface StateOptions<T> {
  batchUpdates?: boolean;
  batchDelay?: number;
  compareFunction?: (prev: T, next: T) => boolean;
  onStateChange?: (newState: T) => void;
}

export function useOptimizedState<T>(
  initialState: T | (() => T),
  options: StateOptions<T> = {}
) {
  const {
    batchUpdates = false,
    batchDelay = 100,
    compareFunction = (prev, next) => prev === next,
    onStateChange,
  } = options;

  const [state, setState] = useState<T>(initialState);
  const batchedUpdatesRef = useRef<T[]>([]);
  const isProcessingRef = useRef(false);

  // Debounced state for batch updates
  const debouncedState = useDebounce(state, batchDelay);

  // Effect to handle debounced state changes
  useEffect(() => {
    if (onStateChange && !isProcessingRef.current) {
      onStateChange(debouncedState);
    }
  }, [debouncedState, onStateChange]);

  // Optimized setState function
  const setOptimizedState = useCallback(
    (update: T | ((prev: T) => T)) => {
      const newState =
        typeof update === 'function'
          ? (update as (prev: T) => T)(state)
          : update;

      // Skip update if state hasn't changed according to compare function
      if (compareFunction(state, newState)) {
        return;
      }

      if (batchUpdates) {
        batchedUpdatesRef.current.push(newState);

        if (!isProcessingRef.current) {
          isProcessingRef.current = true;

          // Process batched updates in the next tick
          Promise.resolve().then(() => {
            const updates = batchedUpdatesRef.current;
            batchedUpdatesRef.current = [];

            // Apply the last update from the batch
            const finalState = updates[updates.length - 1];
            setState(finalState);

            isProcessingRef.current = false;
          });
        }
      } else {
        setState(newState);
      }
    },
    [state, batchUpdates, compareFunction]
  );

  // Function to force immediate update
  const forceUpdate = useCallback((update: T | ((prev: T) => T)) => {
    isProcessingRef.current = true;
    setState(update);
    isProcessingRef.current = false;
  }, []);

  // Reset batched updates
  const resetBatch = useCallback(() => {
    batchedUpdatesRef.current = [];
    isProcessingRef.current = false;
  }, []);

  return {
    state,
    setState: setOptimizedState,
    forceUpdate,
    resetBatch,
    isPending: isProcessingRef.current,
    batchedUpdates: batchedUpdatesRef.current,
  };
}
