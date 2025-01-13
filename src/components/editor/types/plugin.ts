import type { Editor, Selection, FormatType } from '../types';

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

export type PluginEventHandler = (...args: any[]) => void;

export interface IPluginEventBus {
  on: (event: string, handler: PluginEventHandler) => void;
  off: (event: string, handler: PluginEventHandler) => void;
  emit: (event: string, ...args: any[]) => void;
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
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  enabled?: boolean;
  category?: string;
  isEnabled?: () => boolean;
  execute: (...args: any[]) => void;
}

// Plugin Decoration Interface
export interface IDecoration {
  id: string;
  type: 'inline' | 'block';
  pattern: RegExp | string;
  render: (match: RegExpMatchArray) => string;
  priority?: number;
}

export interface IPluginHooks {
  beforeContentChange?: (content: string) => string | void;
  afterContentChange?: (content: string) => void;
  beforeFormat?: (type: FormatType, selection: Selection) => boolean;
  afterFormat?: (type: FormatType, selection: Selection) => void;
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
