import type { Editor } from '../types';
import type {
  IPlugin,
  IPluginEventBus,
  PluginEventHandler,
} from '../types/plugin';

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  eventBus: IPluginEventBus;
  private editor: Editor;
  private eventHandlers: Map<string, Set<PluginEventHandler>>;

  constructor(editor: Editor) {
    this.editor = editor;
    this.eventHandlers = new Map();
    this.eventBus = {
      emit: this.emit.bind(this),
      on: this.on.bind(this),
      off: this.off.bind(this),
    };
  }

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id ${plugin.id} is already registered`);
    }

    // Initialize plugin with event bus
    if (plugin.init) {
      plugin.init(this.editor, this.eventBus);
    }

    // Call lifecycle mount hook
    if (plugin.lifecycle?.onMount) {
      plugin.lifecycle.onMount(this.editor);
    }

    this.plugins.set(plugin.id, plugin);
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // Call lifecycle unmount hook
    if (plugin.lifecycle?.onUnmount) {
      plugin.lifecycle.onUnmount();
    }

    // Cleanup plugin
    if (plugin.destroy) {
      plugin.destroy();
    }

    this.plugins.delete(pluginId);
  }

  enable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
    }
  }

  disable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
    }
  }

  resolveDependencies(): void {
    const visited = new Set<string>();
    const resolved = new Set<string>();
    const loadOrder: string[] = [];

    const visit = (pluginId: string) => {
      if (resolved.has(pluginId)) return;
      if (visited.has(pluginId)) {
        throw new Error(`Circular dependency detected for plugin: ${pluginId}`);
      }

      visited.add(pluginId);
      const plugin = this.plugins.get(pluginId);

      if (plugin?.dependencies) {
        for (const depId of plugin.dependencies) {
          if (!this.plugins.has(depId)) {
            throw new Error(
              `Missing dependency: ${depId} for plugin: ${pluginId}`
            );
          }
          visit(depId);
        }
      }

      resolved.add(pluginId);
      loadOrder.push(pluginId);
    };

    // Visit all plugins to resolve dependencies
    Array.from(this.plugins.keys()).forEach(visit);

    // Sort by priority within dependency constraints
    loadOrder.sort((a, b) => {
      const pluginA = this.plugins.get(a);
      const pluginB = this.plugins.get(b);
      return (pluginB?.priority || 0) - (pluginA?.priority || 0);
    });
  }

  getLoadOrder(): string[] {
    const loadOrder: string[] = [];
    const visited = new Set<string>();
    const resolved = new Set<string>();

    const visit = (pluginId: string) => {
      if (resolved.has(pluginId)) return;
      if (visited.has(pluginId)) {
        throw new Error(`Circular dependency detected for plugin: ${pluginId}`);
      }

      visited.add(pluginId);
      const plugin = this.plugins.get(pluginId);

      if (plugin?.dependencies) {
        for (const depId of plugin.dependencies) {
          visit(depId);
        }
      }

      resolved.add(pluginId);
      loadOrder.push(pluginId);
    };

    Array.from(this.plugins.keys()).forEach(visit);

    return loadOrder;
  }

  // Event Bus Implementation
  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      Array.from(handlers).forEach(handler => handler(...args));
    }
  }

  on(event: string, handler: PluginEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: PluginEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
}

export default PluginManager;
