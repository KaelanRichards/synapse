import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Input, Textarea, Select, Button, Alert } from '@/components/ui';

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  };
}

const MATURITY_OPTIONS = [
  { value: 'SEED', label: 'Seed' },
  { value: 'SAPLING', label: 'Sapling' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'MATURE', label: 'Mature' },
  { value: 'EVOLVING', label: 'Evolving' },
];

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote }) => {
  const router = useRouter();
  const supabase = useSupabase();
  const [note, setNote] = useState({
    title: initialNote?.title || '',
    content: initialNote?.content || '',
    maturity_state: initialNote?.maturity_state || 'SEED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (initialNote?.id) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title: note.title,
            content: note.content,
            maturity_state: note.maturity_state,
          })
          .eq('id', initialNote.id);

        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert([
            {
              title: note.title,
              content: note.content,
              maturity_state: note.maturity_state,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) router.push(`/notes/${data.id}`);
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save note. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Title</label>
        <Input
          id="title"
          value={note.title}
          onChange={e => setNote({ ...note, title: e.target.value })}
          required
          placeholder="Enter note title"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Content</label>
        <Textarea
          id="content"
          value={note.content}
          onChange={e => setNote({ ...note, content: e.target.value })}
          rows={8}
          required
          placeholder="Enter note content"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Maturity State
        </label>
        <Select
          id="maturity"
          value={note.maturity_state}
          onChange={e =>
            setNote({ ...note, maturity_state: e.target.value as any })
          }
        >
          {MATURITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting
            ? 'Saving...'
            : initialNote?.id
              ? 'Update Note'
              : 'Create Note'}
        </Button>
      </div>
    </form>
  );
};

export default NoteEditor;
