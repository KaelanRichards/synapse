import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from './SupabaseContext';
import { SHORTCUTS } from '@/lib/keyboard';
import CommandPalette from '@/components/CommandPalette';

interface EditorState {
  mode: 'write' | 'focus' | 'preview';
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  autoSave: boolean;
  fontSize: number;
  fontFamily: string;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

interface EditorContextType {
  state: EditorState;
  isCommandPaletteOpen: boolean;
  currentNote: {
    id?: string;
    title: string;
    content: string;
    maturity_state: string;
  } | null;
  recentNotes: any[];
  setMode: (mode: EditorState['mode']) => void;
  setTheme: (theme: EditorState['theme']) => void;
  toggleSound: () => void;
  toggleAutoSave: () => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  saveNote: () => Promise<void>;
  updateNote: (content: string) => void;
  createNewNote: () => Promise<void>;
}

const defaultState: EditorState = {
  mode: 'write',
  theme: 'system',
  soundEnabled: false,
  autoSave: true,
  fontSize: 16,
  fontFamily: 'serif',
  saveStatus: 'saved',
};

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const supabase = useSupabase();
  const [state, setState] = useState<EditorState>(defaultState);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [currentNote, setCurrentNote] =
    useState<EditorContextType['currentNote']>(null);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  const setMode = useCallback((mode: EditorState['mode']) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setTheme = useCallback((theme: EditorState['theme']) => {
    setState(prev => ({ ...prev, theme }));
    if (theme !== 'system') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, []);

  const toggleSound = useCallback(() => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleAutoSave = useCallback(() => {
    setState(prev => ({ ...prev, autoSave: !prev.autoSave }));
  }, []);

  const setFontSize = useCallback((fontSize: number) => {
    setState(prev => ({ ...prev, fontSize }));
  }, []);

  const setFontFamily = useCallback((fontFamily: string) => {
    setState(prev => ({ ...prev, fontFamily }));
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const saveNote = useCallback(async () => {
    if (!currentNote) return;

    try {
      setState(prev => ({ ...prev, saveStatus: 'saving' }));

      if (currentNote.id) {
        await supabase
          .from('notes')
          .update({
            title: currentNote.title,
            content: currentNote.content,
            maturity_state: currentNote.maturity_state,
          })
          .eq('id', currentNote.id);
      } else {
        const { data } = await supabase
          .from('notes')
          .insert([
            {
              title: currentNote.title,
              content: currentNote.content,
              maturity_state: currentNote.maturity_state,
            },
          ])
          .select()
          .single();

        if (data) {
          setCurrentNote({ ...currentNote, id: data.id });
          router.push(`/notes/${data.id}`);
        }
      }

      setState(prev => ({ ...prev, saveStatus: 'saved' }));
    } catch (err) {
      console.error('Error saving note:', err);
      setState(prev => ({ ...prev, saveStatus: 'unsaved' }));
    }
  }, [currentNote, supabase, router]);

  const updateNote = useCallback((content: string) => {
    setCurrentNote(prev => {
      if (!prev) {
        // Create a new note if none exists
        return {
          title: content.split('\n')[0] || 'Untitled Note',
          content,
          maturity_state: 'SEED',
        };
      }
      return {
        ...prev,
        content,
        title: content.split('\n')[0] || 'Untitled Note',
      };
    });
  }, []);

  const createNewNote = useCallback(async () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
      maturity_state: 'SEED',
    };
    setCurrentNote(newNote);
    setState(prev => ({ ...prev, saveStatus: 'unsaved' }));
    router.push('/notes/new');
  }, [router]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle all meta/ctrl key combinations we care about
      if (e.metaKey || e.ctrlKey) {
        const key = e.key.toLowerCase();

        switch (key) {
          case 's': // Save
            e.stopPropagation();
            e.preventDefault();
            saveNote();
            return false;

          case 'k': // Command palette
            e.stopPropagation();
            e.preventDefault();
            setIsCommandPaletteOpen(true);
            return false;

          case 'n': // New note
            e.stopPropagation();
            e.preventDefault();
            createNewNote();
            return false;

          case 'f': // Focus mode or prevent find
            e.stopPropagation();
            e.preventDefault();
            if (e.shiftKey) {
              setMode('focus');
            }
            return false;

          case 'p': // Prevent print
            e.stopPropagation();
            e.preventDefault();
            return false;

          case 'w': // Prevent close
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
      }
    };

    // Add both keydown and keypress handlers with capture
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keypress', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keypress', handleKeyDown, { capture: true });
    };
  }, [saveNote, createNewNote, setMode, setIsCommandPaletteOpen]);

  // Auto-save functionality
  useEffect(() => {
    if (!state.autoSave || !currentNote?.content) return;

    const saveTimeout = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [currentNote?.content, state.autoSave, saveNote]);

  // Update save status when note changes
  useEffect(() => {
    if (currentNote?.content) {
      setState(prev => ({ ...prev, saveStatus: 'unsaved' }));
    }
  }, [currentNote?.content]);

  const value = {
    state,
    isCommandPaletteOpen,
    currentNote,
    recentNotes,
    setMode,
    setTheme,
    toggleSound,
    toggleAutoSave,
    setFontSize,
    setFontFamily,
    openCommandPalette,
    closeCommandPalette,
    saveNote,
    updateNote,
    createNewNote,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
        currentNote={
          currentNote
            ? {
                id: currentNote.id,
                title: currentNote.title,
                content: currentNote.content,
              }
            : undefined
        }
      />
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
