import { Plugin, Editor } from '../types';

interface PluginModule {
  default: new () => Plugin;
}

interface PluginRegistry {
  [key: string]: {
    module: () => Promise<PluginModule>;
    instance?: Plugin;
    loading: boolean;
    error?: Error;
  };
}

export class PluginLoader {
  private editor: Editor;
  private registry: PluginRegistry = {};
  private loadingPromises: Map<string, Promise<Plugin>> = new Map();

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public register(pluginId: string, importFn: () => Promise<PluginModule>) {
    this.registry[pluginId] = {
      module: importFn,
      loading: false,
    };
  }

  public async load(pluginId: string): Promise<Plugin> {
    // Return cached promise if already loading
    const existingPromise = this.loadingPromises.get(pluginId);
    if (existingPromise) {
      return existingPromise;
    }

    const plugin = this.registry[pluginId];
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not registered`);
    }

    // Return cached instance if already loaded
    if (plugin.instance) {
      return plugin.instance;
    }

    // Create new loading promise
    const loadPromise = this.loadPlugin(pluginId);
    this.loadingPromises.set(pluginId, loadPromise);

    try {
      const instance = await loadPromise;
      this.loadingPromises.delete(pluginId);
      return instance;
    } catch (error) {
      this.loadingPromises.delete(pluginId);
      throw error;
    }
  }

  private async loadPlugin(pluginId: string): Promise<Plugin> {
    const plugin = this.registry[pluginId];
    plugin.loading = true;

    try {
      const pluginModule = await plugin.module();
      const PluginClass = pluginModule.default;
      const instance = new PluginClass();

      // Initialize plugin
      if (instance.init) {
        const cleanup = instance.init(this.editor);
        if (cleanup) {
          // Store cleanup function for later
          const originalDestroy = instance.destroy;
          instance.destroy = () => {
            cleanup();
            if (originalDestroy) {
              originalDestroy.call(instance);
            }
          };
        }
      }

      plugin.instance = instance;
      plugin.loading = false;
      return instance;
    } catch (error) {
      plugin.loading = false;
      plugin.error = error as Error;
      throw error;
    }
  }

  public async loadMultiple(pluginIds: string[]): Promise<Plugin[]> {
    return Promise.all(pluginIds.map(id => this.load(id)));
  }

  public unload(pluginId: string): void {
    const plugin = this.registry[pluginId];
    if (plugin?.instance?.destroy) {
      plugin.instance.destroy();
    }
    if (plugin) {
      delete plugin.instance;
      plugin.error = undefined;
    }
  }

  public isLoading(pluginId: string): boolean {
    return this.registry[pluginId]?.loading || false;
  }

  public getError(pluginId: string): Error | undefined {
    return this.registry[pluginId]?.error;
  }

  public getInstance(pluginId: string): Plugin | undefined {
    return this.registry[pluginId]?.instance;
  }
}
