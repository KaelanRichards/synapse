import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { createEditor } from 'lexical';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';

export default function NewNote() {
  const router = useRouter();
  const { createNote } = useNoteMutations();

  useEffect(() => {
    const createNewNote = async () => {
      try {
        const editor = createEditor();
        const emptyState = editor.getEditorState();

        const newNote = await createNote({
          title: 'Untitled Note',
          content: {
            text: '',
            editorState: {
              type: 'SynapseEditor',
              content: emptyState.toJSON(),
            },
          },
          is_pinned: false,
        });

        router.replace(`/notes/${newNote.id}`);
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    };

    createNewNote();
  }, [createNote, router]);

  return null;
}
