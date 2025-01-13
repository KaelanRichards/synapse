import type { UIState, UIActions } from '../types';
import type { StateCreator } from 'zustand';
import type { EditorStore } from '../types';

interface UISliceState {
  isAmbientSound: boolean;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
}

interface UISliceActions {
  toggleAmbientSound: () => void;
  setShowToolbar: (show: boolean) => void;
  setToolbarPosition: (position: { x: number; y: number }) => void;
}

export type UISlice = UISliceState & UISliceActions;

export const createUISlice: StateCreator<
  EditorStore,
  [['zustand/immer', never]],
  [],
  UISlice
> = set => ({
  // Editor-specific UI state
  isAmbientSound: false,
  showToolbar: false,
  toolbarPosition: { x: 0, y: 0 },

  // Editor-specific UI actions
  toggleAmbientSound: () =>
    set((state: EditorStore) => {
      state.isAmbientSound = !state.isAmbientSound;
      return state;
    }),

  setShowToolbar: (show: boolean) =>
    set((state: EditorStore) => {
      state.showToolbar = show;
      return state;
    }),

  setToolbarPosition: (position: { x: number; y: number }) =>
    set((state: EditorStore) => {
      state.toolbarPosition = position;
      return state;
    }),
});
