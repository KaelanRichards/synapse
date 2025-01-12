"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createConnection, searchNotes } from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Connection {
  id: string;
  noteFrom: string;
  noteTo: string;
  connectionType: "related" | "prerequisite" | "refines";
  strength: number;
  bidirectional: boolean;
  context?: string;
  emergent: boolean;
}

interface ConnectionManagerProps {
  noteId: string;
  existingConnections: Connection[];
  onConnectionsChange?: () => void;
  noteTo: string;
  connectionType: "related" | "prerequisite" | "refines";
  onClose: () => void;
}

export default function ConnectionManager({
  noteId,
  existingConnections,
  onConnectionsChange,
  noteTo,
  connectionType,
  onClose,
}: ConnectionManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [strength, setStrength] = useState(5);
  const [context, setContext] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchNotes(debouncedQuery);
        // Filter out the current note and already connected notes
        const filteredResults = results.filter(
          (note) =>
            note.id !== noteId &&
            !existingConnections.some((conn) => conn.noteTo === note.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching notes:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedQuery, noteId, existingConnections]);

  const handleCreateConnection = async () => {
    if (!selectedNote) return;

    try {
      await createConnection(
        noteId,
        selectedNote.id,
        connectionType,
        strength,
        false,
        context
      );

      onConnectionsChange?.();
      setSelectedNote(null);
      setSearchQuery("");
      setContext("");
      setStrength(5);
    } catch (error) {
      console.error("Error creating connection:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search for notes */}
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700"
        >
          Search for notes to connect
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Type to search notes..."
            disabled={!!selectedNote}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchQuery && !selectedNote && (
          <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200 max-h-48 overflow-auto">
            {searchResults.map((note) => (
              <li
                key={note.id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <div className="text-sm font-medium text-gray-900">
                  {note.title}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {note.content}
                </div>
              </li>
            ))}
            {searchResults.length === 0 && !isSearching && (
              <li className="p-3 text-sm text-gray-500">No results found</li>
            )}
          </ul>
        )}
      </div>

      {/* Selected Note */}
      {selectedNote && (
        <div className="bg-gray-50 p-4 rounded-md relative">
          <button
            onClick={() => setSelectedNote(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium text-gray-900">
            {selectedNote.title}
          </div>
          <div className="mt-1 text-sm text-gray-500 line-clamp-2">
            {selectedNote.content}
          </div>
        </div>
      )}

      {/* Connection Settings */}
      {selectedNote && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Connection Type
            </label>
            <select
              value={connectionType}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="related">Related</option>
              <option value="prerequisite">Prerequisite</option>
              <option value="refines">Refines</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="strength"
              className="block text-sm font-medium text-gray-700"
            >
              Connection Strength: {strength}
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
          </div>

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
              rows={2}
              className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              placeholder="Add context about this connection..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateConnection}
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Connection
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
