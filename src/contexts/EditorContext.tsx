import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { useNoteMutations } from '@/hooks/useNoteMutations';

interface EditorState {
  mode: 'default' | 'focus';
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: number;
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  autoSave: boolean;
}

type EditorAction =
  | { type: 'SET_MODE'; payload: EditorState['mode'] }
  | { type: 'SET_FONT_FAMILY'; payload: EditorState['fontFamily'] }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_THEME'; payload: EditorState['theme'] }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_AUTO_SAVE' };

const initialState: EditorState = {
  mode: 'default',
  fontFamily: 'serif',
  fontSize: 16,
  theme: 'system',
  soundEnabled: true,
  autoSave: true,
};

const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_FONT_FAMILY':
      return { ...state, fontFamily: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'TOGGLE_AUTO_SAVE':
      return { ...state, autoSave: !state.autoSave };
    default:
      return state;
  }
};

interface EditorContextType {
  state: EditorState;
  setMode: (mode: EditorState['mode']) => void;
  setFontFamily: (family: EditorState['fontFamily']) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: EditorState['theme']) => void;
  toggleSound: () => void;
  toggleAutoSave: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const setMode = useCallback((mode: EditorState['mode']) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const setFontFamily = useCallback((family: EditorState['fontFamily']) => {
    dispatch({ type: 'SET_FONT_FAMILY', payload: family });
  }, []);

  const setFontSize = useCallback((size: number) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: size });
  }, []);

  const setTheme = useCallback((theme: EditorState['theme']) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const toggleSound = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND' });
  }, []);

  const toggleAutoSave = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_SAVE' });
  }, []);

  const value = {
    state,
    setMode,
    setFontFamily,
    setFontSize,
    setTheme,
    toggleSound,
    toggleAutoSave,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
