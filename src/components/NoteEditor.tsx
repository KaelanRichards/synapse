import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Input, Textarea, Select, Button, Alert } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  };
  onPreview?: () => void;
}

const MATURITY_OPTIONS = [
  { value: 'SEED', label: 'Seed', description: 'Initial thoughts and ideas' },
  {
    value: 'SAPLING',
    label: 'Sapling',
    description: 'Growing and taking shape',
  },
  { value: 'GROWTH', label: 'Growth', description: 'Developing connections' },
  { value: 'MATURE', label: 'Mature', description: 'Well-developed thoughts' },
  {
    value: 'EVOLVING',
    label: 'Evolving',
    description: 'Continuously updating',
  },
];

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onPreview }) => {
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
    <div className="min-h-screen bg-mist-white dark:bg-mist-black text-mist-black dark:text-mist-white">
      <form onSubmit={handleSubmit} className="note-content">
        <div className="space-y-8">
          <div className="space-y-4">
            <Input
              id="title"
              value={note.title}
              onChange={e => setNote({ ...note, title: e.target.value })}
              required
              placeholder="Note Title"
              className="text-2xl font-serif bg-transparent border-0 focus:ring-0 p-0 placeholder-mist-black/50"
            />

            <div className="flex items-center space-x-4">
              <div className="relative group flex-shrink-0">
                <Select
                  id="maturity"
                  value={note.maturity_state}
                  onChange={e =>
                    setNote({ ...note, maturity_state: e.target.value as any })
                  }
                  className={cn(
                    'w-40 bg-transparent border rounded-md text-sm',
                    'transition-all duration-medium ease-flow',
                    'focus:ring-1 focus:ring-water-light focus:shadow-deep-well',
                    `note-state-${note.maturity_state.toLowerCase()}`
                  )}
                >
                  {MATURITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <div className="absolute left-0 w-40 mt-2 py-2 px-3 bg-mist-white dark:bg-mist-black rounded-md shadow-deep-well opacity-0 group-hover:opacity-100 transition-all duration-medium ease-flow pointer-events-none">
                  {
                    MATURITY_OPTIONS.find(
                      opt => opt.value === note.maturity_state
                    )?.description
                  }
                </div>
              </div>
            </div>
          </div>

          <Textarea
            id="content"
            value={note.content}
            onChange={e => setNote({ ...note, content: e.target.value })}
            required
            placeholder="Begin writing..."
            className={cn(
              'min-h-[70vh] w-full bg-transparent border-0 focus:ring-0',
              'font-serif text-base leading-relaxed placeholder-mist-black/50',
              'resize-none transition-all duration-medium ease-flow'
            )}
          />
        </div>

        {error && (
          <Alert
            variant="error"
            className="mt-6 bg-error-50 text-error-700 border border-error-200 rounded-lg p-4 shadow-light-mist"
          >
            {error}
          </Alert>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-mist-white/85 dark:bg-mist-black/85 backdrop-blur-xs border-t border-garden-thread p-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={onPreview}
              className="text-water-deep hover:text-water-light transition-all duration-medium ease-flow"
            >
              Preview
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              className={cn(
                'px-6 py-2 rounded-lg shadow-light-mist',
                'transition-all duration-medium ease-flow',
                'disabled:opacity-50'
              )}
            >
              {isSubmitting
                ? 'Saving...'
                : initialNote?.id
                  ? 'Update Note'
                  : 'Create Note'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;
