import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: number;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontFamily: (family: 'serif' | 'sans' | 'mono') => void;
  setFontSize: (size: number) => void;
}

export const useUIStore = create<UIState>(set => ({
  theme: 'light',
  fontFamily: 'sans',
  fontSize: 16,
  setTheme: theme => set({ theme }),
  setFontFamily: fontFamily => set({ fontFamily }),
  setFontSize: fontSize => set({ fontSize }),
}));
