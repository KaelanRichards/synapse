"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getNoteWithConnections } from "@/lib/supabase";
import NoteEditor from "@/components/NoteEditor";
import ConnectionManager from "@/components/ConnectionManager";
import VersionHistory from "@/components/VersionHistory";
import {
  PencilIcon,
  LinkIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface NoteDetailPageProps {
  params: {
    id: string;
  };
}

export default function NoteDetailPage({ params }: NoteDetailPageProps) {
  const session = useSession();
  const router = useRouter();
  const [note, setNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isManagingConnections, setIsManagingConnections] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadNote = useCallback(async () => {
    try {
      const noteData = await getNoteWithConnections(params.id);
      setNote(noteData);
    } catch (error) {
      console.error("Error loading note:", error);
      // TODO: Add proper error handling UI
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }

    loadNote();
  }, [session, params.id, router, loadNote]);

  const handleRevertVersion = async (versionId: string) => {
    try {
      // The revert logic is already implemented in the supabase.ts file
      await loadNote();
    } catch (error) {
      console.error("Error reverting version:", error);
    }
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

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Note not found</h1>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Note</h1>
          <NoteEditor
            mode="edit"
            initialData={{
              id: note.id,
              title: note.title,
              content: note.content,
              maturity_state: note.maturity_state,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsViewingHistory(!isViewingHistory)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isViewingHistory ? (
                <XMarkIcon className="h-5 w-5 mr-2" />
              ) : (
                <ClockIcon className="h-5 w-5 mr-2" />
              )}
              {isViewingHistory ? "Close History" : "View History"}
            </button>
            <button
              onClick={() => setIsManagingConnections(!isManagingConnections)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LinkIcon className="h-5 w-5 mr-2" />
              {isManagingConnections ? "Done" : "Manage Connections"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit
            </button>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* Maturity State Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {note.maturity_state}
                </span>
              </div>

              {/* Note Content */}
              <div className="mt-4 text-gray-900 whitespace-pre-wrap">
                {note.content}
              </div>

              {/* Metadata */}
              <div className="mt-8 border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(note.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Version History */}
              {isViewingHistory && (
                <div className="mt-8 border-t border-gray-200 pt-4">
                  <VersionHistory
                    noteId={note.id}
                    currentContent={note.content}
                    onRevert={handleRevertVersion}
                  />
                </div>
              )}

              {/* Connections Section */}
              <div className="mt-8 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Connected Notes
                  </h3>
                </div>

                {isManagingConnections ? (
                  <ConnectionManager
                    noteId={note.id}
                    existingConnections={note.connections || []}
                    onConnectionsChange={loadNote}
                  />
                ) : note.connections && note.connections.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {note.connections.map((connection: any) => (
                      <li key={connection.id} className="py-4">
                        <Link
                          href={`/notes/${connection.note_to}`}
                          className="block hover:bg-gray-50 -m-4 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {connection.connection_type}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Strength: {connection.strength}
                                </span>
                              </div>
                              {connection.context && (
                                <p className="mt-2 text-sm text-gray-500">
                                  {connection.context}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No connections yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
