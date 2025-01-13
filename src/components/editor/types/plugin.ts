import type { Editor, Selection, FormatType } from '../types';

// Plugin Configuration
export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  priority?: number;
  enabled?: boolean;
  options?: Record<string, unknown>;
}

// Plugin Lifecycle Hooks
export interface PluginLifecycle {
  onMount?: (editor: Editor) => void | (() => void);
  onUnmount?: () => void;
  onChange?: (content: string, prevContent: string) => void;
  onSelectionChange?: (selection: Selection | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Plugin Event System
export type PluginEventHandler = (...args: any[]) => void;

export interface PluginEventBus {
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: PluginEventHandler) => void;
  off: (event: string, handler: PluginEventHandler) => void;
}

// Base Plugin Interface
export interface Plugin<TState = Record<string, unknown>> {
  config: PluginConfig;
  lifecycle?: PluginLifecycle;
  state: TState;
  commands?: Command[];
  decorations?: Decoration[];
  eventBus?: PluginEventBus;
  id: string;
  name: string;
  hooks: {
    [key: string]: (...args: any[]) => void;
  } & PluginHooks;
  beforeContentChange?: (content: string) => string;
  afterContentChange?: (content: string) => void;
  beforeFormat?: (type: FormatType, selection: Selection) => boolean;
  afterFormat?: (type: FormatType, selection: Selection) => void;
  setup?: (editor: Editor, eventBus: PluginEventBus) => void | (() => void);
  init?: (editor: Editor, eventBus: PluginEventBus) => void | (() => void);
  destroy?: () => void;
  getCommands?: (editor: Editor) => Command[];
}

// Plugin Manager Interface
export interface PluginManager {
  plugins: Map<string, Plugin>;
  eventBus: PluginEventBus;

  // Plugin lifecycle management
  register: (plugin: Plugin) => void;
  unregister: (pluginId: string) => void;
  enable: (pluginId: string) => void;
  disable: (pluginId: string) => void;

  // Plugin dependencies
  resolveDependencies: () => void;
  getLoadOrder: () => string[];

  // Event management
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: PluginEventHandler) => void;
  off: (event: string, handler: PluginEventHandler) => void;
}

// Plugin Command Interface
export interface Command {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  category?: string;
  isEnabled?: () => boolean;
  execute: (...args: any[]) => void;
}

// Plugin Decoration Interface
export interface Decoration {
  id: string;
  type: 'inline' | 'block';
  range: Selection;
  attributes: Record<string, string>;
  className?: string;
}

export interface PluginHooks {
  beforeContentChange?: (content: string) => string;
  afterContentChange?: (content: string) => void;
  beforeFormat?: (type: FormatType, selection: Selection) => boolean;
  afterFormat?: (type: FormatType, selection: Selection) => void;
}
