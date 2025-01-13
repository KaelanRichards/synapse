import { createPlugin } from './BasePlugin';
import type { Editor } from '../types';

interface AutosaveState {
  lastSaveTime: number;
  isDirty: boolean;
  isSaving: boolean;
}

const AUTOSAVE_DELAY = 2000; // 2 seconds

export const AutosavePlugin = createPlugin<AutosaveState>({
  id: 'autosave',
  name: 'Autosave',

  initialState: {
    lastSaveTime: Date.now(),
    isDirty: false,
    isSaving: false,
  },

  setup: (editor: Editor) => {
    let saveTimeout: NodeJS.Timeout;

    const handleContentChange = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      saveTimeout = setTimeout(async () => {
        if (editor.state.content) {
          editor.state.saveStatus = 'saving';
          try {
            // Implement your save logic here
            await editor.save?.();
            editor.state.saveStatus = 'saved';
          } catch (error) {
            editor.state.saveStatus = 'error';
            console.error('Autosave failed:', error);
          }
        }
      }, AUTOSAVE_DELAY);
    };

    // Subscribe to content changes
    editor.on('change', handleContentChange);

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      editor.off('change', handleContentChange);
    };
  },

  getCommands: editor => [
    {
      id: 'save',
      name: 'Save',
      description: 'Save the current document',
      category: 'File',
      execute: async () => {
        if (editor.state.content) {
          editor.state.saveStatus = 'saving';
          try {
            await editor.save?.();
            editor.state.saveStatus = 'saved';
          } catch (error) {
            editor.state.saveStatus = 'error';
            console.error('Save failed:', error);
          }
        }
      },
    },
  ],
});
