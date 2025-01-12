"use client";

import { useState, useEffect } from "react";
import { getNoteVersions } from "@/lib/supabase";
import { ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { diffChars } from "diff";

interface VersionHistoryProps {
  noteId: string;
  currentContent: string;
  onRevert: (versionId: string) => Promise<void>;
}

interface Version {
  id: string;
  content: string;
  version_number: number;
  created_at: string;
}

export default function VersionHistory({
  noteId,
  currentContent,
  onRevert,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    async function loadVersions() {
      try {
        const versionHistory = await getNoteVersions(noteId);
        setVersions(versionHistory);
      } catch (error) {
        console.error("Error loading versions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadVersions();
  }, [noteId]);

  const handleRevert = async (version: Version) => {
    if (!version || isReverting) return;

    setIsReverting(true);
    try {
      await onRevert(version.id);
      setSelectedVersion(null);
    } catch (error) {
      console.error("Error reverting version:", error);
    } finally {
      setIsReverting(false);
    }
  };

  const getDiff = (oldContent: string, newContent: string) => {
    const differences = diffChars(oldContent, newContent);
    return differences.map((part, index) => {
      const color = part.added
        ? "bg-green-100 text-green-800"
        : part.removed
        ? "bg-red-100 text-red-800"
        : "";
      return (
        <span key={index} className={color}>
          {part.value}
        </span>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Version History</h3>
        <p className="mt-1 text-sm text-gray-500">
          View and restore previous versions of this note.
        </p>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-6">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No version history
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Changes to this note will be tracked here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-lg overflow-hidden ${
                selectedVersion?.id === version.id
                  ? "border-indigo-500 ring-1 ring-indigo-500"
                  : "border-gray-200"
              }`}
            >
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Version {version.version_number}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      setSelectedVersion(
                        selectedVersion?.id === version.id ? null : version
                      )
                    }
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {selectedVersion?.id === version.id
                      ? "Hide"
                      : "Show Changes"}
                  </button>
                  {version.version_number !== versions[0].version_number && (
                    <button
                      onClick={() => handleRevert(version)}
                      disabled={isReverting}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isReverting ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        "Revert to This Version"
                      )}
                    </button>
                  )}
                </div>
              </div>
              {selectedVersion?.id === version.id && (
                <div className="p-4 bg-white">
                  <div className="prose prose-sm max-w-none">
                    {getDiff(version.content, currentContent)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
