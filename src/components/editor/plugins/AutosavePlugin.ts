import { Plugin, Editor } from '../types';
import { useNoteMutations } from '@/hooks/useNoteMutations';

interface AutosaveState {
  lastSavedContent: string;
  lastSaveTime: number;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  errorMessage?: string;
}

export class AutosavePlugin implements Plugin {
  public readonly id = 'autosave';
  public readonly name = 'Autosave';
  private editor: Editor | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DELAY = 1000; // 1 second
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private retryAttempts = 0;

  private state: AutosaveState = {
    lastSavedContent: '',
    lastSaveTime: 0,
    saveStatus: 'saved',
  };

  public init(editor: Editor) {
    this.editor = editor;
    this.state.lastSavedContent = editor.state.content;

    editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: { pluginId: this.id, state: this.state },
    });

    return () => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      this.editor = null;
    };
  }

  public hooks = {
    afterContentChange: (content: string) => {
      this.scheduleSave(content);
    },
  };

  private scheduleSave(content: string) {
    if (!this.editor) return;

    // Clear any pending save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Don't save if content hasn't changed
    if (content === this.state.lastSavedContent) {
      return;
    }

    // Update state to show pending save
    this.updateState({
      saveStatus: 'unsaved',
    });

    // Schedule new save
    this.saveTimeout = setTimeout(() => {
      this.save(content);
    }, this.SAVE_DELAY);
  }

  private async save(content: string) {
    if (!this.editor) return;

    try {
      this.updateState({
        saveStatus: 'saving',
      });

      // Simulate API call - replace with actual save implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      this.updateState({
        lastSavedContent: content,
        lastSaveTime: Date.now(),
        saveStatus: 'saved',
        errorMessage: undefined,
      });

      this.retryAttempts = 0;
    } catch (error) {
      console.error('Failed to save:', error);

      if (this.retryAttempts < this.MAX_RETRY_ATTEMPTS) {
        this.retryAttempts++;
        this.updateState({
          saveStatus: 'unsaved',
          errorMessage: `Save failed, retrying... (${this.retryAttempts}/${this.MAX_RETRY_ATTEMPTS})`,
        });
        setTimeout(() => this.save(content), 1000 * this.retryAttempts);
      } else {
        this.updateState({
          saveStatus: 'error',
          errorMessage:
            'Failed to save after multiple attempts. Please try again.',
        });
      }
    }
  }

  private updateState(newState: Partial<AutosaveState>) {
    if (!this.editor) return;

    this.state = {
      ...this.state,
      ...newState,
    };

    this.editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: { pluginId: this.id, state: this.state },
    });
  }
}
