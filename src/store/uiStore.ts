import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: 'serif' | 'sans' | 'mono';
}

interface UIActions {
  setTheme: (theme: UIState['theme']) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: UIState['fontFamily']) => void;
}

const initialState: UIState = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'sans',
};

export const useUIStore = create<UIState & UIActions>()(
  immer(
    persist(
      set => ({
        ...initialState,

        setTheme: theme => set({ theme }),

        setFontSize: fontSize => set({ fontSize }),

        setFontFamily: fontFamily => set({ fontFamily }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);
