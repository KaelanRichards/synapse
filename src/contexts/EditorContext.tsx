import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import { useNoteMutations } from '@/hooks/useNoteMutations';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useAuth } from '@/contexts/AuthContext';

interface EditorState {
  mode: 'default' | 'focus';
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: number;
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  autoSave: boolean;
  focusMode: {
    enabled: boolean;
    hideCommands: boolean;
    dimSurroundings: boolean;
  };
  typewriterMode: {
    enabled: boolean;
    sound: boolean;
    scrollIntoView: boolean;
  };
}

type EditorAction =
  | { type: 'SET_MODE'; payload: EditorState['mode'] }
  | { type: 'SET_FONT_FAMILY'; payload: EditorState['fontFamily'] }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_THEME'; payload: EditorState['theme'] }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_AUTO_SAVE' }
  | { type: 'SET_FOCUS_MODE'; payload: Partial<EditorState['focusMode']> }
  | {
      type: 'SET_TYPEWRITER_MODE';
      payload: Partial<EditorState['typewriterMode']>;
    }
  | { type: 'LOAD_SAVED_STATE'; payload: EditorState };

const defaultState: EditorState = {
  mode: 'default',
  fontFamily: 'serif',
  fontSize: 16,
  theme: 'system',
  soundEnabled: false,
  autoSave: true,
  focusMode: {
    enabled: false,
    hideCommands: true,
    dimSurroundings: true,
  },
  typewriterMode: {
    enabled: false,
    sound: false,
    scrollIntoView: true,
  },
};

// Load initial state from localStorage or use default
const loadSavedState = (): EditorState => {
  if (typeof window === 'undefined') return defaultState;

  const saved = localStorage.getItem('editorSettings');
  if (!saved) return defaultState;

  try {
    const parsed = JSON.parse(saved);
    return { ...defaultState, ...parsed };
  } catch (e) {
    console.error('Failed to parse saved editor settings:', e);
    return defaultState;
  }
};

const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  let newState: EditorState;

  switch (action.type) {
    case 'SET_MODE':
      newState = { ...state, mode: action.payload };
      break;
    case 'SET_FONT_FAMILY':
      newState = { ...state, fontFamily: action.payload };
      break;
    case 'SET_FONT_SIZE':
      newState = { ...state, fontSize: action.payload };
      break;
    case 'SET_THEME':
      newState = { ...state, theme: action.payload };
      break;
    case 'TOGGLE_SOUND':
      newState = { ...state, soundEnabled: !state.soundEnabled };
      break;
    case 'TOGGLE_AUTO_SAVE':
      newState = { ...state, autoSave: !state.autoSave };
      break;
    case 'SET_FOCUS_MODE':
      newState = {
        ...state,
        focusMode: { ...state.focusMode, ...action.payload },
      };
      break;
    case 'SET_TYPEWRITER_MODE':
      newState = {
        ...state,
        typewriterMode: { ...state.typewriterMode, ...action.payload },
      };
      break;
    case 'LOAD_SAVED_STATE':
      newState = action.payload;
      break;
    default:
      return state;
  }

  // Save to localStorage after each change
  if (typeof window !== 'undefined') {
    localStorage.setItem('editorSettings', JSON.stringify(newState));
  }

  return newState;
};

interface EditorContextType {
  state: EditorState;
  setMode: (mode: EditorState['mode']) => void;
  setFontFamily: (family: EditorState['fontFamily']) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: EditorState['theme']) => void;
  toggleSound: () => void;
  toggleAutoSave: () => void;
  setFocusMode: (settings: Partial<EditorState['focusMode']>) => void;
  setTypewriterMode: (settings: Partial<EditorState['typewriterMode']>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, defaultState);
  const supabase = useSupabase();
  const { user } = useAuth();

  // Load settings from database or localStorage
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        const localState = loadSavedState();
        dispatch({ type: 'LOAD_SAVED_STATE', payload: localState });
        return;
      }

      try {
        // Try to load from database first
        const { data, error } = await supabase
          .from('user_settings')
          .select('editor_settings')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data?.editor_settings) {
          dispatch({
            type: 'LOAD_SAVED_STATE',
            payload: { ...defaultState, ...data.editor_settings },
          });
        } else {
          // If no settings in DB, try localStorage
          const localState = loadSavedState();
          dispatch({ type: 'LOAD_SAVED_STATE', payload: localState });

          // Save localStorage settings to DB if they exist
          if (localState !== defaultState) {
            await supabase.from('user_settings').upsert({
              user_id: user.id,
              editor_settings: localState,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings from database:', err);
        // Fallback to localStorage
        const localState = loadSavedState();
        dispatch({ type: 'LOAD_SAVED_STATE', payload: localState });
      }
    }

    loadSettings();
  }, [user, supabase]);

  // Save settings to database when they change
  useEffect(() => {
    async function saveSettings() {
      if (!user) return;

      try {
        const { error } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          editor_settings: state,
        });

        if (error) throw error;
      } catch (err) {
        console.error('Failed to save settings to database:', err);
      }
    }

    // Debounce save to avoid too many database calls
    const timeoutId = setTimeout(saveSettings, 1000);
    return () => clearTimeout(timeoutId);
  }, [state, user, supabase]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    const theme = state.theme === 'system' ? systemTheme : state.theme;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

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

  const setFocusMode = useCallback(
    (settings: Partial<EditorState['focusMode']>) => {
      dispatch({ type: 'SET_FOCUS_MODE', payload: settings });
    },
    []
  );

  const setTypewriterMode = useCallback(
    (settings: Partial<EditorState['typewriterMode']>) => {
      dispatch({ type: 'SET_TYPEWRITER_MODE', payload: settings });
    },
    []
  );

  const value = {
    state,
    setMode,
    setFontFamily,
    setFontSize,
    setTheme,
    toggleSound,
    toggleAutoSave,
    setFocusMode,
    setTypewriterMode,
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
