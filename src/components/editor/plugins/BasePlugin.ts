import type { Plugin, Editor, Command, Decoration } from '../types';
import { useEffect } from 'react';

// Plugin state type for better type inference
export interface PluginState<T = unknown> {
  id: string;
  name: string;
  state: T;
}

// Hook-friendly plugin interface
export interface HookPlugin<T = unknown> extends Plugin {
  usePlugin: (editor: Editor) => PluginState<T>;
  getCommands: (editor: Editor) => Command[];
  getDecorations: (editor: Editor) => Decoration[];
}

// Base class for class-based plugins (legacy support)
export abstract class BasePlugin implements Plugin {
  public readonly id: string;
  public readonly name: string;
  public commands: Command[] = [];
  public decorations: Decoration[] = [];
  protected editor: Editor | null = null;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  public init = (editor: Editor): void | (() => void) => {
    this.editor = editor;
    return this.destroy;
  };

  public destroy = (): void => {
    this.commands = [];
    this.decorations = [];
    this.editor = null;
  };

  protected registerCommand(
    command: Partial<Command> & Pick<Command, 'id' | 'name'>
  ): void {
    const fullCommand: Command = {
      ...command,
      description: command.description ?? '',
      category: command.category ?? 'default',
      isEnabled: command.isEnabled ?? (() => true),
      execute: command.execute ?? (() => {}),
    };
    this.commands.push(fullCommand);
  }

  protected registerDecoration(
    decoration: Partial<Decoration> & Pick<Decoration, 'id' | 'range'>
  ): void {
    const fullDecoration: Decoration = {
      ...decoration,
      type: decoration.type ?? 'inline',
      attributes: decoration.attributes ?? {},
      className: decoration.className ?? '',
    };
    this.decorations.push(fullDecoration);
  }
}

// Helper to create hook-based plugins
export function createPlugin<T = unknown>(config: {
  id: string;
  name: string;
  initialState: T;
  setup?: (editor: Editor) => void | (() => void);
  getCommands?: (editor: Editor, state: T) => Command[];
  getDecorations?: (editor: Editor, state: T) => Decoration[];
}): HookPlugin<T> {
  return {
    id: config.id,
    name: config.name,

    usePlugin: (editor: Editor) => {
      useEffect(() => {
        return config.setup?.(editor);
      }, [editor]);

      return {
        id: config.id,
        name: config.name,
        state: config.initialState,
      };
    },

    getCommands: (editor: Editor) =>
      config.getCommands?.(editor, config.initialState) ?? [],

    getDecorations: (editor: Editor) =>
      config.getDecorations?.(editor, config.initialState) ?? [],

    init: () => {},
    destroy: () => {},
  };
}
