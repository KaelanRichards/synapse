"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/types";
import {
  getNoteWithConnections,
  createConnection,
  searchNotes,
} from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";

interface ConnectionFormProps {
  params: {
    id: string;
  };
}

export default function ConnectionForm({ params }: ConnectionFormProps) {
  const router = useRouter();
  const [sourceNote, setSourceNote] = useState<Note | null>(null);
  const [targetNoteId, setTargetNoteId] = useState("");
  const [connectionType, setConnectionType] = useState<
    "related" | "prerequisite" | "refines"
  >("related");
  const [strength, setStrength] = useState(1);
  const [bidirectional, setBidirectional] = useState(false);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function fetchSourceNote() {
      try {
        const noteData = await getNoteWithConnections(params.id);
        setSourceNote(noteData as Note);
      } catch (err) {
        setError("Failed to load note");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSourceNote();
  }, [params.id]);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchQuery) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchNotes(debouncedSearchQuery);
        // Filter out the source note from results
        setSearchResults(
          results.filter((note) => note.id !== sourceNote?.id) as Note[]
        );
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery, sourceNote?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNote || !targetNoteId) return;

    try {
      setLoading(true);
      await createConnection(
        sourceNote.id,
        targetNoteId,
        connectionType,
        strength,
        bidirectional,
        context || undefined
      );
      router.push(`/notes/${sourceNote.id}`);
    } catch (err) {
      setError("Failed to create connection");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error || !sourceNote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || "Note not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="text-primary-600 hover:text-primary-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create Connection
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                {sourceNote.title}
              </div>
            </div>

            {/* Target Note Search */}
            <div>
              <label
                htmlFor="target"
                className="block text-sm font-medium text-gray-700"
              >
                To
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="target"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search for a note..."
                />
              </div>
              {/* Search Results */}
              {isSearching ? (
                <div className="mt-2 text-sm text-gray-500">Searching...</div>
              ) : (
                searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                    {searchResults.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          targetNoteId === note.id ? "bg-primary-50" : ""
                        }`}
                        onClick={() => setTargetNoteId(note.id)}
                      >
                        <div className="font-medium text-gray-900">
                          {note.title}
                        </div>
                        <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Connection Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Connection Type
              </label>
              <select
                id="type"
                value={connectionType}
                onChange={(e) =>
                  setConnectionType(e.target.value as typeof connectionType)
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="related">Related</option>
                <option value="prerequisite">Prerequisite</option>
                <option value="refines">Refines</option>
              </select>
            </div>

            {/* Connection Strength */}
            <div>
              <label
                htmlFor="strength"
                className="block text-sm font-medium text-gray-700"
              >
                Connection Strength
              </label>
              <input
                type="range"
                id="strength"
                min="1"
                max="10"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="mt-1 block w-full"
              />
              <div className="mt-1 text-sm text-gray-500 text-center">
                {strength}
              </div>
            </div>

            {/* Bidirectional Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bidirectional"
                checked={bidirectional}
                onChange={(e) => setBidirectional(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="bidirectional"
                className="ml-2 block text-sm text-gray-700"
              >
                Bidirectional Connection
              </label>
            </div>

            {/* Context */}
            <div>
              <label
                htmlFor="context"
                className="block text-sm font-medium text-gray-700"
              >
                Context (Optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add context about this connection..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push(`/notes/${sourceNote.id}`)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!targetNoteId || loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                Create Connection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
