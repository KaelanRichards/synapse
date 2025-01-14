import { create } from 'zustand';
import type { LexicalEditor, TextFormatType } from 'lexical';

interface EditorState {
  editor: LexicalEditor | null;
  isEditorFocused: boolean;
  activeFormats: Set<TextFormatType>;
  activeNodes: Set<string>;
  isSaving: boolean;
  isInitializing: boolean;
  isLoadingContent: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  error: Error | null;
}

interface EditorActions {
  setEditor: (editor: LexicalEditor) => void;
  setEditorFocused: (focused: boolean) => void;
  setActiveFormats: (formats: Set<TextFormatType>) => void;
  setActiveNodes: (nodes: Set<string>) => void;
  setSaving: (saving: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setLoadingContent: (loading: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState: EditorState = {
  editor: null,
  isEditorFocused: false,
  activeFormats: new Set(),
  activeNodes: new Set(),
  isSaving: false,
  isInitializing: true,
  isLoadingContent: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  error: null,
};

export const useEditorStore = create<EditorState & EditorActions>(set => ({
  ...initialState,

  setEditor: editor => set({ editor }),

  setEditorFocused: focused => set({ isEditorFocused: focused }),

  setActiveFormats: formats => set({ activeFormats: new Set(formats) }),

  setActiveNodes: nodes => set({ activeNodes: new Set(nodes) }),

  setSaving: saving => set({ isSaving: saving }),

  setInitializing: initializing => set({ isInitializing: initializing }),

  setLoadingContent: loading => set({ isLoadingContent: loading }),

  setHasUnsavedChanges: hasChanges => set({ hasUnsavedChanges: hasChanges }),

  setLastSavedAt: date => set({ lastSavedAt: date }),

  setError: error => set({ error }),

  reset: () => set(initialState),
}));
