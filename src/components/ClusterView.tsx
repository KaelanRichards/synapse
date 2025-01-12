"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Note, Connection } from "@/types";
import { useRouter } from "next/navigation";
import MaturityBadge from "./MaturityBadge";

interface ClusterViewProps {
  notes: Note[];
  connections: Connection[];
  onNodeClick?: (noteId: string) => void;
  className?: string;
}

const nodeTypes = {
  note: ({ data }: { data: { note: Note } }) => (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 truncate">
          {data.note.title}
        </h3>
        <MaturityBadge state={data.note.maturity_state} />
      </div>
      <p className="text-sm text-gray-500 line-clamp-2">{data.note.content}</p>
    </div>
  ),
};

export default function ClusterView({
  notes,
  connections,
  onNodeClick,
  className = "",
}: ClusterViewProps) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const transformNotesToNodes = useCallback((): Node[] => {
    return notes.map((note) => ({
      id: note.id,
      type: "note",
      data: { note },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    }));
  }, [notes]);

  const transformConnectionsToEdges = useCallback((): Edge[] => {
    return connections.map((conn) => ({
      id: conn.id,
      source: conn.note_from,
      target: conn.note_to,
      type: "smoothstep",
      animated: conn.emergent,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: conn.connection_type === "prerequisite" ? "#4F46E5" : "#10B981",
        strokeWidth: conn.strength,
      },
      data: {
        type: conn.connection_type,
        strength: conn.strength,
        context: conn.context,
      },
    }));
  }, [connections]);

  useEffect(() => {
    setNodes(transformNotesToNodes());
    setEdges(transformConnectionsToEdges());
  }, [
    notes,
    connections,
    transformNotesToNodes,
    transformConnectionsToEdges,
    setNodes,
    setEdges,
  ]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    } else {
      router.push(`/notes/${node.id}`);
    }
  };

  return (
    <div className={`w-full h-[600px] ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
