import React, { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  ConnectionMode,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNote } from '@/hooks/useNote';
import { cn } from '@/lib/utils';
import { maturityStateColors, connectionColors } from '@/theme/tokens';

interface NoteGraphProps {
  noteId: string;
  className?: string;
  isBackground?: boolean;
}

type ConnectionType = 'related' | 'prerequisite' | 'refines';

const NoteGraph: React.FC<NoteGraphProps> = ({
  noteId,
  className = '',
  isBackground = false,
}) => {
  const { data, error, isLoading } = useNote(noteId);

  const nodes: Node[] = useMemo(() => {
    if (!data) return [];

    const centerX = 0;
    const centerY = 0;
    const radius = 150;
    const angleStep = (2 * Math.PI) / (data.connections.length || 1);

    return [
      {
        id: data.id,
        data: { label: data.title },
        position: { x: centerX, y: centerY },
        style: {
          background: maturityStateColors[data.maturity_state].bg,
          border: `1px solid ${maturityStateColors[data.maturity_state].border}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          fontFamily: 'Merriweather, Georgia, serif',
          width: 180,
          textAlign: 'center' as const,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
      ...data.connections.map((conn, index) => ({
        id: conn.note_to,
        data: { label: conn.context || 'Connected Note' },
        position: {
          x: centerX + radius * Math.cos(index * angleStep),
          y: centerY + radius * Math.sin(index * angleStep),
        },
        style: {
          background: 'rgba(248, 250, 252, 0.9)',
          border: `1px solid ${connectionColors[conn.connection_type as ConnectionType].color}`,
          borderRadius: '8px',
          padding: '8px',
          fontSize: '12px',
          fontFamily: 'Merriweather, Georgia, serif',
          width: 150,
          textAlign: 'center' as const,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      })),
    ];
  }, [data]);

  const edges: Edge[] = useMemo(() => {
    if (!data) return [];

    return data.connections.map(conn => ({
      id: conn.id,
      source: conn.note_from,
      target: conn.note_to,
      label: conn.connection_type,
      type: 'smoothstep',
      animated:
        connectionColors[conn.connection_type as ConnectionType].animated,
      style: {
        stroke: connectionColors[conn.connection_type as ConnectionType].color,
        strokeWidth: 1,
        opacity: 0.7,
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      labelStyle: {
        fill: connectionColors[conn.connection_type as ConnectionType].color,
        fontFamily: 'Inter, sans-serif',
        fontSize: 10,
      },
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] text-water-deep animate-pulse">
        Loading knowledge graph...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] text-error-700">
        Error:{' '}
        {error instanceof Error
          ? error.message
          : 'An unexpected error occurred'}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className={cn(
        'w-full h-[500px]',
        isBackground && 'graph-background',
        className
      )}
    >
      <ReactFlowProvider>
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            connectionMode={ConnectionMode.Loose}
            nodesDraggable={!isBackground}
            nodesConnectable={!isBackground}
            elementsSelectable={!isBackground}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={2}
            className="bg-transparent"
          >
            <Background
              color="#eaeaea"
              style={{ backgroundColor: 'transparent' }}
              size={1.5}
              gap={16}
            />
            <Controls
              className={cn(
                'bg-mist-white dark:bg-mist-black border border-garden-thread',
                'rounded-lg shadow-light-mist transition-all duration-medium ease-flow'
              )}
              style={{ backgroundColor: 'transparent' }}
            />
            {!isBackground && (
              <Panel
                position="top-right"
                className={cn(
                  'bg-mist-white dark:bg-mist-black p-3 rounded-lg',
                  'border border-garden-thread shadow-light-mist',
                  'transition-all duration-medium ease-flow'
                )}
              >
                <div className="text-sm text-water-deep">
                  <div className="mb-2.5">Connection Types:</div>
                  {Object.entries(connectionColors).map(([type, style]) => (
                    <div
                      key={type}
                      className="flex items-center space-x-2.5 mb-1.5"
                    >
                      <div
                        className="w-4 h-0.5 rounded-full"
                        style={{ backgroundColor: style.color }}
                      />
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default NoteGraph;
