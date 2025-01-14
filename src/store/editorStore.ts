import { create } from 'zustand';
import type { LexicalEditor } from 'lexical';

interface EditorStore {
  editor: LexicalEditor | null;
  setEditor: (editor: LexicalEditor) => void;
  isEditorFocused: boolean;
  setEditorFocused: (focused: boolean) => void;
  activeFormats: Set<string>;
  setActiveFormats: (formats: Set<string>) => void;
}

const useEditorStore = create<EditorStore>(set => ({
  editor: null,
  setEditor: editor => set({ editor }),
  isEditorFocused: false,
  setEditorFocused: focused => set({ isEditorFocused: focused }),
  activeFormats: new Set(),
  setActiveFormats: formats => set({ activeFormats: new Set(formats) }),
}));

export default useEditorStore;
