import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import NoteEditor from '@/components/NoteEditor';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useEditor } from '@/contexts/EditorContext';

const NotePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabase();
  const { updateNote } = useEditor();

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
        return;
      }

      if (data) {
        updateNote(data.content);
      }
    };

    fetchNote();
  }, [id, supabase, updateNote]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NoteEditor />
    </div>
  );
};

export default NotePage;
