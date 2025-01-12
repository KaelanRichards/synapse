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

interface NoteGraphProps {
  noteId: string;
  className?: string;
  isBackground?: boolean;
}

type ConnectionType = 'related' | 'prerequisite' | 'refines';

const NODE_TYPES = {
  SEED: {
    color: 'rgba(167, 201, 167, 0.15)',
    border: 'rgba(167, 201, 167, 0.3)',
  },
  SAPLING: {
    color: 'rgba(179, 157, 219, 0.15)',
    border: 'rgba(179, 157, 219, 0.3)',
  },
  GROWTH: {
    color: 'rgba(144, 202, 249, 0.15)',
    border: 'rgba(144, 202, 249, 0.3)',
  },
  MATURE: {
    color: 'rgba(255, 183, 77, 0.15)',
    border: 'rgba(255, 183, 77, 0.3)',
  },
  EVOLVING: {
    color: 'rgba(229, 115, 115, 0.15)',
    border: 'rgba(229, 115, 115, 0.3)',
  },
} as const;

const EDGE_TYPES: Record<ConnectionType, { color: string; animated: boolean }> =
  {
    related: { color: '#B9B0A2', animated: false },
    prerequisite: { color: '#8B7C66', animated: true },
    refines: { color: '#6F6352', animated: true },
  };

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
          background: NODE_TYPES[data.maturity_state].color,
          border: `1px solid ${NODE_TYPES[data.maturity_state].border}`,
          borderRadius: '4px',
          padding: '12px',
          fontSize: '14px',
          fontFamily: 'Bookerly, Georgia, serif',
          width: 180,
          textAlign: 'center' as const,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
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
          background: 'rgba(248, 246, 241, 0.9)',
          border: `1px solid ${EDGE_TYPES[conn.connection_type as ConnectionType].color}`,
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          fontFamily: 'Bookerly, Georgia, serif',
          width: 150,
          textAlign: 'center' as const,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
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
      animated: EDGE_TYPES[conn.connection_type as ConnectionType].animated,
      style: {
        stroke: EDGE_TYPES[conn.connection_type as ConnectionType].color,
        strokeWidth: 1,
      },
      labelStyle: {
        fill: EDGE_TYPES[conn.connection_type as ConnectionType].color,
        fontFamily: 'Inter, sans-serif',
        fontSize: 10,
      },
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] text-accent-400">
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
      className={`w-full h-[500px] ${isBackground ? 'graph-background' : ''} ${className}`}
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
              color="#A29684"
              style={{ backgroundColor: 'transparent' }}
              size={1.5}
              gap={16}
            />
            <Controls
              className="bg-paper-light dark:bg-paper-dark border border-accent-200 rounded-lg shadow-sm"
              style={{ backgroundColor: 'transparent' }}
            />
            {!isBackground && (
              <Panel
                position="top-right"
                className="bg-paper-light dark:bg-paper-dark p-2 rounded-lg shadow-sm border border-accent-200"
              >
                <div className="text-sm text-accent-600">
                  <div className="mb-2">Connection Types:</div>
                  {Object.entries(EDGE_TYPES).map(([type, style]) => (
                    <div
                      key={type}
                      className="flex items-center space-x-2 mb-1"
                    >
                      <div
                        className="w-4 h-0.5"
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
