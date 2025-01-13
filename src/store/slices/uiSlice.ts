import type { UIState, UIActions } from '../types';
import type { StateCreator } from 'zustand';
import type { EditorStore } from '../types';

interface UISliceState {
  isParagraphFocus: boolean;
  isAmbientSound: boolean;
  showToolbar: boolean;
  toolbarPosition: { x: number; y: number };
  typewriterMode: {
    enabled: boolean;
    sound: boolean;
    scrollIntoView: boolean;
  };
}

interface UISliceActions {
  toggleParagraphFocus: () => void;
  toggleAmbientSound: () => void;
  toggleTypewriterMode: () => void;
  setShowToolbar: (show: boolean) => void;
  setToolbarPosition: (position: { x: number; y: number }) => void;
  setTypewriterMode: (settings: Partial<UISlice['typewriterMode']>) => void;
}

export type UISlice = UISliceState & UISliceActions;

export const createUISlice: StateCreator<
  EditorStore,
  [['zustand/immer', never]],
  [],
  UISlice
> = set => ({
  // Editor-specific UI state
  isParagraphFocus: false,
  isAmbientSound: false,
  showToolbar: false,
  toolbarPosition: { x: 0, y: 0 },
  typewriterMode: {
    enabled: false,
    sound: false,
    scrollIntoView: false,
  },

  // Editor-specific UI actions
  toggleParagraphFocus: () =>
    set((state: EditorStore) => {
      state.isParagraphFocus = !state.isParagraphFocus;
      return state;
    }),

  toggleAmbientSound: () =>
    set((state: EditorStore) => {
      state.isAmbientSound = !state.isAmbientSound;
      return state;
    }),

  toggleTypewriterMode: () =>
    set((state: EditorStore) => {
      state.typewriterMode.enabled = !state.typewriterMode.enabled;
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

  setTypewriterMode: (settings: Partial<UISlice['typewriterMode']>) =>
    set((state: EditorStore) => {
      state.typewriterMode = { ...state.typewriterMode, ...settings };
      return state;
    }),
});
