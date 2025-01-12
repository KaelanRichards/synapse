"use client";

import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRecentNotes } from "@/lib/supabase";
import NoteSearch from "@/components/NoteSearch";

const NOTES_PER_PAGE = 10;

export default function RecentNotesPage() {
  const session = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }

    async function loadNotes() {
      try {
        const fetchedNotes = await getRecentNotes(NOTES_PER_PAGE * currentPage);
        setNotes(fetchedNotes);
        setHasMore(fetchedNotes.length === NOTES_PER_PAGE * currentPage);
      } catch (error) {
        console.error("Error loading notes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, [session, router, currentPage]);

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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recent Notes</h1>
          <Link
            href="/notes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Note
          </Link>
        </div>

        <div className="mb-8">
          <NoteSearch placeholder="Search all notes..." className="max-w-2xl" />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {note.title}
                        </p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="truncate">
                              Created:{" "}
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="truncate">
                              Updated:{" "}
                              {new Date(note.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {note.maturity_state}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="px-4 py-4 bg-gray-50 sm:px-6">
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Load more notes
              </button>
            </div>
          )}

          {notes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No notes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
