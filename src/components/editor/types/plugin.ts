import type { Editor, Selection, FormatType, CommandMap } from '../types';

// Plugin Configuration Interface
export interface IPluginConfig {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  dependencies?: string[];
  enabled?: boolean;
  priority?: number;
  options?: Record<string, unknown>;
}

// Plugin Lifecycle Interface
export interface IPluginLifecycle {
  onInit?: () => void;
  onDestroy?: () => void;
  onEnable?: () => void;
  onDisable?: () => void;
  onMount?: (editor: Editor) => void;
  onUnmount?: () => void;
  onChange?: (content: string, prevContent: string) => void;
  onSelectionChange?: (selection: Selection | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Define specific event types
export interface EditorEventMap {
  'content:change': [content: string, prevContent: string];
  'selection:change': [selection: Selection | null];
  'editor:focus': [];
  'editor:blur': [];
  'format:before': [type: FormatType, selection: Selection];
  'format:after': [type: FormatType, selection: Selection];
  'format:active-formats-changed': [formats: FormatType[]];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
  paste: [event: ClipboardEvent];
  drop: [event: DragEvent];
}

// Make event handlers type-safe
export type PluginEventHandler<K extends keyof EditorEventMap> = (
  ...args: EditorEventMap[K]
) => void;

export interface IPluginEventBus {
  on: <K extends keyof EditorEventMap>(
    event: K,
    handler: PluginEventHandler<K>
  ) => void;
  off: <K extends keyof EditorEventMap>(
    event: K,
    handler: PluginEventHandler<K>
  ) => void;
  emit: <K extends keyof EditorEventMap>(
    event: K,
    ...args: EditorEventMap[K]
  ) => void;
}

// Base Plugin Interface
export interface IPlugin<TState = Record<string, unknown>> {
  id: string;
  name: string;
  description?: string;
  version?: string;
  state: TState;
  editor: Editor | null;
  hooks: IPluginHooks;
  commands: ICommand[];
  decorations: IDecoration[];
  enabled: boolean;
  priority?: number;
  dependencies?: string[];
  lifecycle?: IPluginLifecycle;
  init?: (editor: Editor, eventBus: IPluginEventBus) => void;
  initialize: () => void;
  destroy: () => void;
  enable: () => void;
  disable: () => void;
  beforeFormat?: (type: FormatType, selection: Selection) => boolean;
  afterFormat?: (type: FormatType, selection: Selection) => void;
  getState: () => TState;
  setState: (state: Partial<TState>) => void;
  getCommands: (editor: Editor) => ICommand[];
  setup?: (editor: Editor, eventBus: IPluginEventBus) => void | (() => void);
}

// Plugin Manager Interface
export interface IPluginManager {
  plugins: Map<string, IPlugin>;
  registerPlugin: (plugin: IPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: <T extends IPlugin>(pluginId: string) => T | undefined;
  enablePlugin: (pluginId: string) => void;
  disablePlugin: (pluginId: string) => void;
  isPluginEnabled: (pluginId: string) => boolean;
  getPluginState: <T>(pluginId: string) => T | undefined;
  setPluginState: <T>(pluginId: string, state: T) => void;
}

// Plugin Command Interface
export interface ICommand {
  id: keyof CommandMap;
  name: string;
  description?: string;
  shortcut?: string;
  enabled?: boolean;
  category?: string;
  isEnabled?: () => boolean;
  execute: <K extends keyof CommandMap>(...args: CommandMap[K]) => void;
}

// Plugin Decoration Interface
export interface IDecoration {
  id: string;
  type: 'inline' | 'block';
  pattern: RegExp | string;
  render: (match: RegExpMatchArray) => string;
  priority?: number;
}

// Define specific hook types
export interface IPluginHooks {
  beforeContentChange?: (content: string) => string | void;
  afterContentChange?: (content: string) => void;
  beforeFormat?: (type: FormatType, selection: Selection) => boolean;
  afterFormat?: (type: FormatType, selection: Selection) => void;
  onSelectionChange?: (selection: Selection | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onDrop?: (event: DragEvent) => void;
}

// Map event names to their handler types
export type PluginHookMap = {
  [K in keyof EditorEventMap]: (...args: EditorEventMap[K]) => void;
};

// Update IPluginHooks to include dynamic event handlers
export interface IPluginHooks extends Partial<PluginHookMap> {
  [key: string]: ((...args: any[]) => any) | undefined;
}

// Type aliases for backward compatibility
export type Plugin<TState = Record<string, unknown>> = IPlugin<TState>;
export type PluginConfig = IPluginConfig;
export type PluginLifecycle = IPluginLifecycle;
export type PluginEventBus = IPluginEventBus;
export type PluginManager = IPluginManager;
export type Command = ICommand;
export type Decoration = IDecoration;
export type PluginHooks = IPluginHooks;
