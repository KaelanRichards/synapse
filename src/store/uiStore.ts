import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: 'serif' | 'sans' | 'mono';
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

interface UIActions {
  setTheme: (theme: UIState['theme']) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: UIState['fontFamily']) => void;
  setFocusMode: (settings: Partial<UIState['focusMode']>) => void;
  setTypewriterMode: (settings: Partial<UIState['typewriterMode']>) => void;
}

const initialState: UIState = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'sans',
  focusMode: {
    enabled: false,
    hideCommands: false,
    dimSurroundings: false,
  },
  typewriterMode: {
    enabled: false,
    sound: false,
    scrollIntoView: true,
  },
};

export const useUIStore = create<UIState & UIActions>()(
  immer(
    persist(
      set => ({
        ...initialState,

        setTheme: theme => set({ theme }),

        setFontSize: fontSize => set({ fontSize }),

        setFontFamily: fontFamily => set({ fontFamily }),

        setFocusMode: settings =>
          set(state => {
            state.focusMode = { ...state.focusMode, ...settings };
          }),

        setTypewriterMode: settings =>
          set(state => {
            state.typewriterMode = { ...state.typewriterMode, ...settings };
          }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);