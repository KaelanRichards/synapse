"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchNotes } from "@/lib/supabase";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useDebounce } from "@/hooks/useDebounce";

interface NoteSearchProps {
  placeholder?: string;
  className?: string;
}

export default function NoteSearch({
  placeholder = "Search notes...",
  className = "",
}: NoteSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchNotes(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error("Error searching notes:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={placeholder}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (query.trim() || isSearching) && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base sm:text-sm">
            {isSearching ? (
              <li className="relative cursor-default select-none py-2 px-3 text-gray-900">
                <div className="flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
                  <span className="ml-3">Searching...</span>
                </div>
              </li>
            ) : results.length === 0 ? (
              <li className="relative cursor-default select-none py-2 px-3 text-gray-900">
                No results found
              </li>
            ) : (
              results.map((note) => (
                <li
                  key={note.id}
                  onClick={() => handleResultClick(note.id)}
                  className="relative cursor-pointer select-none py-2 px-3 hover:bg-indigo-600 hover:text-white"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{note.title}</span>
                    <span className="text-sm text-gray-500 line-clamp-1 group-hover:text-white">
                      {note.content}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
