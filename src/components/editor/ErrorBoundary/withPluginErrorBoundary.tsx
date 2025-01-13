import React from 'react';
import { PluginErrorBoundary } from './PluginErrorBoundary';
import type { Plugin } from '../types/plugin';

interface WithPluginErrorBoundaryProps {
  plugin: Plugin;
  onError?: (error: Error, errorInfo: React.ErrorInfo, plugin: Plugin) => void;
  onDisablePlugin?: (pluginId: string) => void;
}

export function withPluginErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithErrorBoundary(props: P & WithPluginErrorBoundaryProps) {
    const { plugin, onError, onDisablePlugin, ...componentProps } = props;

    return (
      <PluginErrorBoundary
        plugin={plugin}
        onError={onError}
        onDisablePlugin={onDisablePlugin}
      >
        <WrappedComponent {...(componentProps as P)} />
      </PluginErrorBoundary>
    );
  };
}
