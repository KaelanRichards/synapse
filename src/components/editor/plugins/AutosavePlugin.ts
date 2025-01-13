import { BasePlugin, createPluginConfig } from './BasePlugin';
import type { Editor } from '../types';

interface AutosaveState extends Record<string, unknown> {
  lastSavedContent: string | null;
  isSaving: boolean;
  saveTimeout: number | null;
}

export class AutosavePlugin extends BasePlugin<AutosaveState> {
  private readonly SAVE_DELAY = 1000; // 1 second delay

  constructor() {
    super(
      createPluginConfig('autosave', 'Autosave', '1.0.0', {
        priority: 2,
        options: {
          saveDelay: 1000,
        },
      }),
      {
        onMount: editor => {
          this.state = {
            lastSavedContent: null,
            isSaving: false,
            saveTimeout: null,
          };
        },
        onChange: (content, prevContent) => {
          this.scheduleSave();
        },
        onUnmount: () => {
          if (this.state.saveTimeout) {
            window.clearTimeout(this.state.saveTimeout);
          }
        },
      }
    );
  }

  private scheduleSave(): void {
    if (this.state.saveTimeout) {
      window.clearTimeout(this.state.saveTimeout);
    }

    const timeout = window.setTimeout(() => {
      this.save();
    }, this.SAVE_DELAY);

    this.state.saveTimeout = timeout;
  }

  private async save(): Promise<void> {
    if (!this.editor || this.state.isSaving) return;

    const content = this.editor.state.content;
    if (content === this.state.lastSavedContent) return;

    this.state.isSaving = true;
    this.emit('autosave:saving');

    try {
      // Simulate save - replace with actual save logic
      await new Promise(resolve => setTimeout(resolve, 500));

      this.state.lastSavedContent = content;
      this.emit('autosave:saved');
    } catch (error) {
      this.emit('autosave:error', error);
    } finally {
      this.state.isSaving = false;
    }
  }

  public isSaving(): boolean {
    return this.state.isSaving;
  }

  public getLastSavedContent(): string | null {
    return this.state.lastSavedContent;
  }
}
