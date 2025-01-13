import { useState } from 'react';
import { useRouter } from 'next/router';
import { Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useNoteMutations } from '@/hooks/useNoteMutations';

export default function Home() {
  const router = useRouter();
  const { createNote } = useNoteMutations();
  const [content, setContent] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const note = await createNote.mutateAsync({
      title: content.split('\n')[0] || 'Untitled Note',
      content,
    });

    router.push(`/notes/${note.id}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <Textarea
          value={content}
          onChange={handleChange}
          placeholder="Start writing..."
          className="min-h-[200px] text-lg"
          autoFocus
        />
        <button
          type="submit"
          className={cn(
            'mt-4 px-4 py-2 bg-blue-500 text-white rounded',
            'hover:bg-blue-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          disabled={!content.trim()}
        >
          Create Note
        </button>
      </form>
    </main>
  );
}
