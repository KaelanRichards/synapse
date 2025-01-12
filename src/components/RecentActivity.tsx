"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentNotes } from "@/lib/supabase";
import { ClockIcon } from "@heroicons/react/24/outline";

export default function RecentActivity() {
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentNotes() {
      try {
        const notes = await getRecentNotes(5);
        setRecentNotes(notes);
      } catch (error) {
        console.error("Error loading recent notes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecentNotes();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white shadow rounded-lg p-4"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>
      {recentNotes.length === 0 ? (
        <div className="text-center py-8 bg-white shadow rounded-lg">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No activity
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first note
          </p>
          <div className="mt-6">
            <Link
              href="/notes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Note
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {recentNotes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {note.title}
                        </p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="truncate">
                              {new Date(note.created_at).toLocaleDateString()}
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
          {recentNotes.length >= 5 && (
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <Link
                href="/notes/recent"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all notes
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
