"use client";

import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import NoteSearch from "@/components/NoteSearch";

export default function ExplorePage() {
  const session = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }

    async function loadGraphData() {
      try {
        // Load all notes
        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;

        // Load all connections
        const { data: connectionsData, error: connectionsError } =
          await supabase.from("connections").select("*");

        if (connectionsError) throw connectionsError;

        setNotes(notesData);
        setConnections(connectionsData);
      } catch (error) {
        console.error("Error loading graph data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGraphData();
  }, [session, router]);

  const handleNodeClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  if (!session || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Knowledge Graph Explorer
          </h1>
          <div className="w-96">
            <NoteSearch placeholder="Search notes..." />
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Explore the connections between your notes. Click on any node to view
          the note details.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-500">
                Total Notes: {notes.length}
              </span>
              <span className="mx-4 text-gray-300">|</span>
              <span className="text-sm font-medium text-gray-500">
                Total Connections: {connections.length}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                Related
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Prerequisite
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                Refines
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <KnowledgeGraph
            notes={notes}
            connections={connections}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>
    </div>
  );
}
