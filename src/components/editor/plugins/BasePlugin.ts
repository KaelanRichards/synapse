import type { Plugin, Editor, Command, Decoration } from '../types';

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

  protected getPluginState<T>(): T | undefined {
    if (!this.editor) return undefined;
    return this.editor.state.plugins[this.id] as T;
  }

  protected setPluginState<T>(state: T): void {
    if (!this.editor) return;
    this.editor.dispatch({
      type: 'UPDATE_PLUGIN_STATE',
      payload: { pluginId: this.id, state },
    });
  }

  protected dispatchAction(action: Parameters<Editor['dispatch']>[0]): void {
    this.editor?.dispatch(action);
  }

  protected subscribeToState(
    callback: Parameters<Editor['subscribe']>[0]
  ): () => void {
    if (!this.editor) return () => {};
    return this.editor.subscribe(callback);
  }
}
