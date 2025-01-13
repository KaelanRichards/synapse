import type { Editor, Selection, FormatType } from '../types';
import type {
  EnhancedPlugin,
  PluginConfig,
  PluginLifecycle,
  PluginEventBus,
  Command,
  Decoration,
  PluginHooks,
} from '../types/plugin';

export abstract class BasePlugin<TState extends Record<string, unknown>>
  implements EnhancedPlugin<TState>
{
  public readonly id: string;
  public readonly config: PluginConfig;
  public readonly lifecycle?: PluginLifecycle;
  public state!: TState;
  public commands: Command[] = [];
  public decorations: Decoration[] = [];
  public hooks: {
    [key: string]: (...args: any[]) => void;
  } & PluginHooks = {} as any;
  public eventBus?: PluginEventBus;
  protected editor: Editor | null = null;

  constructor(config: PluginConfig, lifecycle?: PluginLifecycle) {
    this.id = config.id;
    this.config = {
      ...config,
      enabled: config.enabled ?? true,
      priority: config.priority ?? 0,
      options: config.options ?? {},
    };
    this.lifecycle = lifecycle;
  }

  public setup = (
    editor: Editor,
    eventBus: PluginEventBus
  ): void | (() => void) => {
    this.editor = editor;
    this.eventBus = eventBus;

    // Register lifecycle hooks with event bus
    if (this.lifecycle?.onChange) {
      this.eventBus.on('content:change', this.lifecycle.onChange);
    }
    if (this.lifecycle?.onSelectionChange) {
      this.eventBus.on('selection:change', this.lifecycle.onSelectionChange);
    }
    if (this.lifecycle?.onFocus) {
      this.eventBus.on('editor:focus', this.lifecycle.onFocus);
    }
    if (this.lifecycle?.onBlur) {
      this.eventBus.on('editor:blur', this.lifecycle.onBlur);
    }

    // Call mount hook
    if (this.lifecycle?.onMount) {
      this.lifecycle.onMount(editor);
    }

    return this.destroy;
  };

  public destroy = (): void => {
    // Cleanup lifecycle hooks
    if (this.eventBus) {
      if (this.lifecycle?.onChange) {
        this.eventBus.off('content:change', this.lifecycle.onChange);
      }
      if (this.lifecycle?.onSelectionChange) {
        this.eventBus.off('selection:change', this.lifecycle.onSelectionChange);
      }
      if (this.lifecycle?.onFocus) {
        this.eventBus.off('editor:focus', this.lifecycle.onFocus);
      }
      if (this.lifecycle?.onBlur) {
        this.eventBus.off('editor:blur', this.lifecycle.onBlur);
      }
    }

    // Call unmount hook
    if (this.lifecycle?.onUnmount) {
      this.lifecycle.onUnmount();
    }

    this.commands = [];
    this.decorations = [];
    this.editor = null;
    this.eventBus = undefined;
  };

  public getCommands = (editor: Editor): Command[] => {
    return this.commands;
  };

  // Protected helper methods for plugins to use
  protected emit(event: string, ...args: any[]): void {
    this.eventBus?.emit(event, ...args);
  }

  protected on(event: string, handler: (...args: any[]) => void): void {
    this.eventBus?.on(event, handler);
  }

  protected off(event: string, handler: (...args: any[]) => void): void {
    this.eventBus?.off(event, handler);
  }

  protected registerCommand(command: Command): void {
    this.commands.push(command);
  }

  protected addDecoration(decoration: Decoration): void {
    this.decorations.push(decoration);
  }

  protected removeDecoration(decorationId: string): void {
    this.decorations = this.decorations.filter(d => d.id !== decorationId);
  }

  // Optional hook methods that plugins can override
  public beforeContentChange?(content: string): string {
    return content;
  }

  public afterContentChange?(content: string): void {}

  public beforeFormat?(type: FormatType, selection: Selection): boolean {
    return true;
  }

  public afterFormat?(type: FormatType, selection: Selection): void {}
}

// Helper function to create a plugin config
export function createPluginConfig(
  id: string,
  name: string,
  version: string,
  options: Partial<PluginConfig> = {}
): PluginConfig {
  return {
    id,
    name,
    version,
    dependencies: options.dependencies,
    priority: options.priority,
    enabled: options.enabled ?? true,
    options: options.options,
  };
}
