import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import { createEditor } from 'lexical';
import { EditorNodes } from '@/features/editor/config/nodes';
import { $createParagraphNode, $getRoot } from 'lexical';
import { useAuth } from '@/features/auth';

export default function NewNote() {
  const router = useRouter();
  const { createNote } = useNoteMutations();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/signin');
      return;
    }

    const createNewNote = async () => {
      try {
        // Create an empty editor state
        const editor = createEditor({
          namespace: 'SynapseEditor',
          nodes: EditorNodes,
        });

        editor.update(() => {
          const root = $getRoot();
          const paragraph = $createParagraphNode();
          root.append(paragraph);
        });

        const emptyState = editor.getEditorState();

        const newNote = await createNote({
          title: 'Untitled Note',
          content: {
            text: '',
            editorState: {
              type: 'lexical',
              content: emptyState.toJSON(),
            },
          },
          maturity_state: 'SEED',
          is_pinned: false,
        });

        router.replace(`/notes/${newNote.id}`);
      } catch (error) {
        console.error('Failed to create new note:', error);
        router.push('/');
      }
    };

    if (session) {
      createNewNote();
    }
  }, [createNote, router, session, loading]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <div className="p-4">Creating new note...</div>;
}
