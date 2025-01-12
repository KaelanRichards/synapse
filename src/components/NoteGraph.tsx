import React from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  ConnectionMode,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNote } from '@/hooks/useNote';

interface NoteGraphProps {
  noteId: string;
}

const NoteGraph: React.FC<NoteGraphProps> = ({ noteId }) => {
  const { data, error, isLoading } = useNote(noteId);

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  const nodes: Node[] = [
    {
      id: data.id,
      data: { label: data.title },
      position: { x: 250, y: 5 },
      type: 'default',
    },
    ...data.connections.map(conn => ({
      id: conn.note_to,
      data: { label: conn.context || 'Connected Note' },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      type: 'default',
    })),
  ];

  const edges: Edge[] = data.connections.map(conn => ({
    id: conn.id,
    source: conn.note_from,
    target: conn.note_to,
    label: conn.connection_type,
    animated: conn.emergent,
    type: 'default',
  }));

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default NoteGraph;
