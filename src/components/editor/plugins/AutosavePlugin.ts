import type { Plugin, Editor } from '../types';

interface AutosavePluginOptions {
  onSave: (content: string) => Promise<void>;
  delay?: number;
}

export class AutosavePlugin implements Plugin {
  public readonly id = 'autosave';
  public readonly name = 'Autosave';
  private editor: Editor | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private options: AutosavePluginOptions;
  private lastSavedContent: string = '';
  private isSaving: boolean = false;

  constructor(options: AutosavePluginOptions) {
    this.options = {
      delay: 1000,
      ...options,
    };
  }

  init(editor: Editor) {
    this.editor = editor;
    this.lastSavedContent = editor.state.content;

    // Initialize plugin state
    editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: {
        pluginId: this.id,
        state: {
          saveStatus: 'saved' as const,
          lastSaveTime: Date.now(),
        },
      },
    });

    // Subscribe to content changes only
    const unsubscribe = editor.subscribe(state => {
      if (!this.isSaving && state.content !== this.lastSavedContent) {
        this.scheduleSave();
      }
    });

    return () => {
      unsubscribe();
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
    };
  }

  private scheduleSave() {
    if (!this.editor || this.isSaving) return;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.isSaving = true;

    // Update status to saving
    this.editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: {
        pluginId: this.id,
        state: {
          saveStatus: 'saving' as const,
          lastSaveTime: Date.now(),
        },
      },
    });

    // Schedule new save
    this.saveTimeout = setTimeout(async () => {
      if (!this.editor) return;

      try {
        await this.options.onSave(this.editor.state.content);
        this.lastSavedContent = this.editor.state.content;

        this.editor.dispatch({
          type: 'UPDATE_PLUGIN_STATE',
          payload: {
            pluginId: this.id,
            state: {
              saveStatus: 'saved' as const,
              lastSaveTime: Date.now(),
            },
          },
        });
      } catch (error) {
        this.editor.dispatch({
          type: 'UPDATE_PLUGIN_STATE',
          payload: {
            pluginId: this.id,
            state: {
              saveStatus: 'error' as const,
              errorMessage:
                error instanceof Error ? error.message : 'Save failed',
              lastSaveTime: Date.now(),
            },
          },
        });
      } finally {
        this.isSaving = false;
      }
    }, this.options.delay);
  }
}
