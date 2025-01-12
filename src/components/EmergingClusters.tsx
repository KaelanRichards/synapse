"use client";

import { useState, useEffect } from "react";
import { Note, Connection } from "@/types";
import { getRecentNotes, searchNotes } from "@/lib/supabase";
import ClusterView from "./ClusterView";
import NoteCard from "./NoteCard";

interface EmergingClustersProps {
  className?: string;
}

export default function EmergingClusters({
  className = "",
}: EmergingClustersProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");

  useEffect(() => {
    async function fetchEmergingClusters() {
      try {
        // For now, we'll just show recent notes. In the future, this could be
        // enhanced with more sophisticated clustering algorithms
        const recentNotes = await getRecentNotes(10);
        setNotes(recentNotes);

        // Get all connections between these notes
        const noteConnections: Connection[] = [];
        recentNotes.forEach((note) => {
          if (note.connections) {
            noteConnections.push(
              ...note.connections.filter((conn: Connection) =>
                recentNotes.some(
                  (n) => n.id === conn.noteFrom || n.id === conn.noteTo
                )
              )
            );
          }
        });
        setConnections(noteConnections);
        setLoading(false);
      } catch (err) {
        setError("Failed to load emerging clusters");
        setLoading(false);
      }
    }

    fetchEmergingClusters();
  }, []);

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className={`p-4 text-red-600 ${className}`}>{error}</div>;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Emerging Clusters
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("graph")}
            className={`px-3 py-1 rounded-md text-sm ${
              view === "graph"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1 rounded-md text-sm ${
              view === "list"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {view === "graph" ? (
        <ClusterView
          notes={notes}
          connections={connections}
          className="border border-gray-200 rounded-lg"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} showConnections />
          ))}
        </div>
      )}
    </div>
  );
}
