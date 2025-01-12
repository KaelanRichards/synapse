"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNote, updateNote } from "@/lib/supabase";

interface NoteEditorProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    maturity_state?: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
  };
  mode: "create" | "edit";
}

export default function NoteEditor({ initialData, mode }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [maturityState, setMaturityState] = useState<
    "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING"
  >(initialData?.maturity_state || "SEED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const noteId = await createNote(title, content);
        router.push(`/notes/${noteId}`);
      } else if (initialData?.id) {
        await updateNote(initialData.id, {
          title,
          content,
          maturity_state: maturityState,
        });
        router.push(`/notes/${initialData.id}`);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      // TODO: Add proper error handling UI
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      {mode === "edit" && (
        <div>
          <label
            htmlFor="maturity"
            className="block text-sm font-medium text-gray-700"
          >
            Maturity State
          </label>
          <select
            id="maturity"
            value={maturityState}
            onChange={(e) =>
              setMaturityState(
                e.target.value as
                  | "SEED"
                  | "SAPLING"
                  | "GROWTH"
                  | "MATURE"
                  | "EVOLVING"
              )
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="SEED">Seed</option>
            <option value="SAPLING">Sapling</option>
            <option value="GROWTH">Growth</option>
            <option value="MATURE">Mature</option>
            <option value="EVOLVING">Evolving</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
            ? "Create Note"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
