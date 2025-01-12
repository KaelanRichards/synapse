"use client";

import { useState, useEffect } from "react";
import { getNoteVersions } from "@/lib/supabase";
import { VersionHistory } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { diffWords } from "diff";

interface VersionComparisonProps {
  noteId: string;
  currentContent: string;
  onRevert: (versionId: string) => void;
}

export default function VersionComparison({
  noteId,
  currentContent,
  onRevert,
}: VersionComparisonProps) {
  const [versions, setVersions] = useState<VersionHistory[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      try {
        const data = await getNoteVersions(noteId);
        setVersions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load version history");
        setLoading(false);
      }
    }

    fetchVersions();
  }, [noteId]);

  const getVersionContent = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    return version?.content || "";
  };

  const renderDiff = (oldContent: string, newContent: string) => {
    const differences = diffWords(oldContent, newContent);

    return (
      <div className="whitespace-pre-wrap font-mono text-sm">
        {differences.map(
          (
            part: { added?: boolean; removed?: boolean; value: string },
            index: number
          ) => (
            <span
              key={index}
              className={
                part.added
                  ? "bg-green-100 text-green-800"
                  : part.removed
                  ? "bg-red-100 text-red-800 line-through"
                  : ""
              }
            >
              {part.value}
            </span>
          )
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4">Loading version history...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-4 rounded-lg border ${
                selectedVersion === version.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  Version {version.version_number} •{" "}
                  {formatDistanceToNow(new Date(version.created_at), {
                    addSuffix: true,
                  })}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedVersion(version.id)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Changes
                  </button>
                  <button
                    onClick={() => onRevert(version.id)}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Revert to This Version
                  </button>
                </div>
              </div>
              {selectedVersion === version.id && (
                <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                  {renderDiff(getVersionContent(version.id), currentContent)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
