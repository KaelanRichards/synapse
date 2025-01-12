"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

interface KnowledgeGraphProps {
  notes: Array<{
    id: string;
    title: string;
    content: string;
    maturity_state: string;
  }>;
  connections: Array<{
    id: string;
    note_from: string;
    note_to: string;
    connection_type: string;
    strength: number;
  }>;
  onNodeClick?: (noteId: string) => void;
}

const NODE_TYPES = {
  note: NoteNode,
};

function NoteNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg border border-gray-200 bg-white">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex flex-col">
        <div className="font-medium text-sm truncate max-w-[150px]">
          {data.title}
        </div>
        <div className="mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {data.maturity_state}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

export default function KnowledgeGraph({
  notes,
  connections,
  onNodeClick,
}: KnowledgeGraphProps) {
  // Convert notes and connections to React Flow format
  const initialNodes: Node[] = useMemo(
    () =>
      notes.map((note) => ({
        id: note.id,
        type: "note",
        data: {
          title: note.title,
          maturity_state: note.maturity_state,
        },
        position: { x: 0, y: 0 }, // Initial position, will be arranged by layout
      })),
    [notes]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      connections.map((conn) => ({
        id: conn.id,
        source: conn.note_from,
        target: conn.note_to,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: getConnectionColor(conn.connection_type),
          strokeWidth: Math.max(1, Math.min(conn.strength, 5)),
        },
        label: conn.connection_type,
      })),
    [connections]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Automatically layout nodes in a force-directed manner
  const onLayout = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 4;

    // Position nodes in a circle
    const angleStep = (2 * Math.PI) / nodes.length;
    const newNodes = nodes.map((node, index) => {
      const angle = index * angleStep;
      return {
        ...node,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      };
    });

    setNodes(newNodes);
  }, [nodes, setNodes]);

  // Layout nodes on initial render
  useMemo(() => {
    onLayout();
  }, [onLayout]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-[600px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function getConnectionColor(type: string): string {
  switch (type) {
    case "related":
      return "#6366f1"; // indigo-500
    case "prerequisite":
      return "#ef4444"; // red-500
    case "refines":
      return "#10b981"; // emerald-500
    default:
      return "#6b7280"; // gray-500
  }
}
